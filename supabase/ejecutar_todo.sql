-- Ejecutar en Supabase: SQL Editor → New query → Run
-- Crea tablas, RLS, permisos y datos de ejemplo (idempotente en tablas/policies).

create extension if not exists "pgcrypto";

create table if not exists public.productos (
    id uuid primary key default gen_random_uuid(),
    nombre text not null,
    marca text,
    descripcion text,
    genero text,
    tipo text,
    slug text not null unique,
    imagen_principal text,
    notas_salida text,
    notas_corazon text,
    notas_fondo text,
    disponible boolean not null default true,
    destacado boolean not null default false,
    created_at timestamptz not null default now()
);

create table if not exists public.variantes (
    id uuid primary key default gen_random_uuid(),
    producto_id uuid not null references public.productos (id) on delete cascade,
    tamaño text not null,
    precio numeric not null,
    disponible boolean not null default true
);

create index if not exists productos_slug_idx on public.productos (slug);
create index if not exists variantes_producto_idx on public.variantes (producto_id);

alter table public.productos enable row level security;
alter table public.variantes enable row level security;

drop policy if exists "productos_lectura_publica" on public.productos;
create policy "productos_lectura_publica" on public.productos
    for select using (true);

drop policy if exists "variantes_lectura_publica" on public.variantes;
create policy "variantes_lectura_publica" on public.variantes
    for select using (true);

grant usage on schema public to anon, authenticated;
grant select on public.productos to anon, authenticated;
grant select on public.variantes to anon, authenticated;

insert into public.productos (
    nombre, marca, descripcion, genero, tipo, slug,
    notas_salida, notas_corazon, notas_fondo,
    disponible, destacado
) values
    (
        'SAUVAGE', 'DIOR',
        'Una fragancia masculina intensa y especiada, con notas de ambroxan, bergamota y pimienta. Diseñada para el hombre audaz y contemporáneo.',
        'Masculino', 'Eau de Toilette', 'dior-sauvage',
        'Bergamota de Calabria, pimienta',
        'Ambroxan, lavanda, pimienta de Sichuan, pachulí',
        'Ambroxan, cedro, ládano',
        true, true
    ),
    (
        '212vip', 'CAROLINA HERRERA',
        'Eau de toilette masculina, elegante y versátil, perfecta para el día a día con un carácter distintivo.',
        'Masculino', 'Eau de Toilette', 'ch-212-vip',
        'Limón, menta',
        'Notas acuáticas, jengibre, especias',
        'Cuero, madera de gaiac, ámbar',
        true, true
    )
on conflict (slug) do nothing;

insert into public.variantes (producto_id, tamaño, precio, disponible)
select p.id, v.tamaño, v.precio, v.disponible
from (values
    ('dior-sauvage', '100ml', 129.99::numeric, true),
    ('ch-212-vip', '100ml', 109.99::numeric, true)
) as v(slug, tamaño, precio, disponible)
join public.productos p on p.slug = v.slug
where not exists (
    select 1 from public.variantes ex
    where ex.producto_id = p.id and ex.tamaño = v.tamaño
);
