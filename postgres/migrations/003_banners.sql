-- Banners promocionales del inicio (imagenes cargadas desde el panel).
create table if not exists public.banners (
    id uuid primary key default gen_random_uuid(),
    imagen text not null,
    texto_alt text not null default 'Promoción',
    orden integer not null default 0,
    activo boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

drop trigger if exists banners_updated_at on public.banners;
create trigger banners_updated_at
    before update on public.banners
    for each row execute function public.tocar_updated_at();
