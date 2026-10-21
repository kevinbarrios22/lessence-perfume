-- Esquema Parfumerie (PostgreSQL puro, sin Supabase)
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
    etiquetas text[] not null default '{}',
    created_at timestamptz not null default now()
);

create table if not exists public.variantes (
    id uuid primary key default gen_random_uuid(),
    producto_id uuid not null references public.productos (id) on delete cascade,
    tamaño text not null,
    precio numeric not null,
    disponible boolean not null default true,
    constraint variantes_producto_tamano_key unique (producto_id, tamaño)
);

-- El unique de slug ya crea su indice; el unique (producto_id, tamaño)
-- cubre las busquedas por producto.
insert into public.productos (
    nombre, marca, descripcion, genero, tipo, slug,
    notas_salida, notas_corazon, notas_fondo,
    disponible
) values
    (
        'SAUVAGE', 'DIOR',
        'Una fragancia masculina intensa y especiada, con notas de ambroxan, bergamota y pimienta. Diseñada para el hombre audaz y contemporáneo.',
        'Masculino', 'Eau de Toilette', 'dior-sauvage',
        'Bergamota de Calabria, pimienta',
        'Ambroxan, lavanda, pimienta de Sichuan, pachulí',
        'Ambroxan, cedro, ládano',
        true
    ),
    (
        '212vip', 'CAROLINA HERRERA',
        'Eau de toilette masculina, elegante y versátil, perfecta para el día a día con un carácter distintivo.',
        'Masculino', 'Eau de Toilette', 'ch-212-vip',
        'Limón, menta',
        'Notas acuáticas, jengibre, especias',
        'Cuero, madera de gaiac, ámbar',
        true
    )
on conflict (slug) do nothing;

-- Precios en pesos colombianos (COP), sin centavos.
insert into public.variantes (producto_id, tamaño, precio, disponible)
select p.id, v.tamaño, v.precio, v.disponible
from (values
    ('dior-sauvage', '100ml', 84900::numeric, true),
    ('ch-212-vip', '100ml', 84900::numeric, true)
) as v(slug, tamaño, precio, disponible)
join public.productos p on p.slug = v.slug
on conflict (producto_id, tamaño) do nothing;
