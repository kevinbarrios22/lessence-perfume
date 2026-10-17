-- Notas olfativas (usadas en la ficha de producto)
alter table public.productos
    add column if not exists notas_salida text,
    add column if not exists notas_corazon text,
    add column if not exists notas_fondo text;

update public.productos
set
    notas_salida = 'Bergamota de Calabria, pimienta',
    notas_corazon = 'Ambroxan, lavanda, pimienta de Sichuan, pachulí',
    notas_fondo = 'Ambroxan, cedro, ládano'
where slug = 'dior-sauvage';

update public.productos
set
    notas_salida = 'Limón, menta',
    notas_corazon = 'Notas acuáticas, jengibre, especias',
    notas_fondo = 'Cuero, madera de gaiac, ámbar'
where slug = 'ch-212-vip';
