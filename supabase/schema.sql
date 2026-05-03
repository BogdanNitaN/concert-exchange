-- USERS PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('artist','promoter','client','agency')),
  name text,
  email text,
  avatar_url text,
  is_pro boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ARTISTS
create table public.artists (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  slug text unique,
  agency_name text,
  bio text,
  genres text[],
  regions text[],
  cities text[],
  event_types text[],
  tier text check (tier in ('Premium','A+','A')),
  fee_min integer,
  fee_max integer,
  duration_options text[],
  rider_url text,
  lat double precision,
  lng double precision,
  location_city text,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- AVAILABILITY
create table public.availability (
  id uuid default gen_random_uuid() primary key,
  artist_id uuid references public.artists(id) on delete cascade,
  date date not null,
  status text not null check (status in ('liber','partial','ocupat')),
  note_private text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(artist_id, date)
);

-- BOOKING REQUESTS
create table public.requests (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id),
  artist_id uuid references public.artists(id),
  event_type text,
  event_date date,
  city text,
  budget integer,
  message text,
  status text default 'pending' check (status in ('pending','seen','negotiating','confirmed','declined')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- MESSAGES
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.requests(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  content text not null,
  seen boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- NOTIFICATIONS
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type text,
  title text,
  body text,
  data jsonb,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.availability enable row level security;
alter table public.requests enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- POLICIES PROFILES
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- POLICIES ARTISTS
create policy "Artists are viewable by everyone"
  on public.artists for select using (true);
create policy "Artists can update own profile"
  on public.artists for update using (
    auth.uid() = (select profile_id from public.artists where id = artists.id)
  );
create policy "Artists can insert own profile"
  on public.artists for insert with check (
    auth.uid() = profile_id
  );

-- POLICIES AVAILABILITY
create policy "Status only visible to owner"
  on public.availability for select using (
    auth.uid() = (select profile_id from public.artists where id = availability.artist_id)
  );
create policy "Artists can manage own availability"
  on public.availability for all using (
    auth.uid() = (select profile_id from public.artists where id = availability.artist_id)
  );

-- POLICIES REQUESTS
create policy "Senders can see own requests"
  on public.requests for select using (auth.uid() = sender_id);
create policy "Artists can see requests for them"
  on public.requests for select using (
    auth.uid() = (select profile_id from public.artists where id = requests.artist_id)
  );
create policy "Authenticated users can insert requests"
  on public.requests for insert with check (auth.uid() = sender_id);
create policy "Parties can update request status"
  on public.requests for update using (
    auth.uid() = sender_id or
    auth.uid() = (select profile_id from public.artists where id = requests.artist_id)
  );

-- POLICIES MESSAGES
create policy "Parties can see messages"
  on public.messages for select using (
    auth.uid() = sender_id or
    auth.uid() = (select sender_id from public.requests where id = messages.request_id)
  );
create policy "Authenticated users can insert messages"
  on public.messages for insert with check (auth.uid() = sender_id);

-- POLICIES NOTIFICATIONS
create policy "Users see own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications"
  on public.notifications for insert with check (true);
create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- AUTO CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
  