-- Fecha de actualizacion para el sitemap.
alter table public.productos
    add column if not exists updated_at timestamptz not null default now();

create or replace function public.tocar_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end
$$;

drop trigger if exists productos_updated_at on public.productos;
create trigger productos_updated_at
    before update on public.productos
    for each row execute function public.tocar_updated_at();
