-- Tabla de productos (catálogo)
create table if not exists public.productos (
    id uuid primary key default gen_random_uuid(),
    nombre text not null,
    marca text,
    descripcion text,
    genero text,
    tipo text,
    slug text not null unique,
    imagen_principal text,
    disponible boolean not null default true,
    destacado boolean not null default false,
    created_at timestamptz not null default now(),
    notas_salida text,
    notas_corazon text,
    notas_fondo text
);

-- Tabla de variantes (tamaños + precios de cada producto)
create table if not exists public.variantes (
    id uuid primary key default gen_random_uuid(),
    producto_id uuid not null references public.productos (id) on delete cascade,
    tamaño text not null,
    precio numeric not null,
    disponible boolean not null default true
);

-- Índice para búsquedas por slug en el detalle de producto
create index if not exists productos_slug_idx on public.productos (slug);
-- Índice para listar variantes de un producto
create index if not exists variantes_producto_idx on public.variantes (producto_id);

-- RLS: lectura pública permitida, escritura restringida (como en producción)
alter table public.productos enable row level security;
alter table public.variantes enable row level security;

create policy "productos_lectura_publica" on public.productos
    for select using (true);
create policy "variantes_lectura_publica" on public.variantes
    for select using (true);

-- Permisos para que Next.js (rol anon) pueda leer vía Supabase API
grant usage on schema public to anon, authenticated;
grant select on public.productos to anon, authenticated;
grant select on public.variantes to anon, authenticated;

-- Datos iniciales
insert into public.productos (nombre, marca, descripcion, genero, tipo, slug, disponible, destacado, notas_salida, notas_corazon, notas_fondo) values
    ('SAUVAGE', 'DIOR', 'Una fragancia masculina intensa y especiada, con notas de ambroxan, bergamota y pimienta. Diseñada para el hombre audaz y contemporáneo.', 'Masculino', 'Eau de Toilette', 'dior-sauvage', true, true, 'Bergamota de Calabria, pimienta', 'Ambroxan, lavanda, pimienta de Sichuan, pachulí', 'Ambroxan, cedro, ládano'),
    ('212vip', 'CAROLINA HERRERA', 'Eau de toilette masculina, elegante y versátil, perfecta para el día a día con un carácter distintivo.', 'Masculino', 'Eau de Toilette', 'ch-212-vip', true, true, 'Limón, menta', 'Notas acuáticas, jengibre, especias', 'Cuero, madera de gaiac, ámbar');

insert into public.variantes (producto_id, tamaño, precio, disponible) values
    ((select id from public.productos where slug = 'dior-sauvage'), '100ml', 129.99, true),
    ((select id from public.productos where slug = 'ch-212-vip'), '100ml', 109.99, true);