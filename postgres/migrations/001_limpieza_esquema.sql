-- Limpieza de esquema. Idempotente: se puede aplicar sobre una base
-- creada con postgres/init.sql sin cambiar nada.

alter table public.productos drop column if exists destacado;

-- Si existieran variantes repetidas por producto+tamaño, conservar una.
delete from public.variantes a
using public.variantes b
where a.producto_id = b.producto_id
  and a.tamaño = b.tamaño
  and a.ctid > b.ctid;

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'variantes_producto_tamano_key'
          and conrelid = 'public.variantes'::regclass
    ) then
        alter table public.variantes
            add constraint variantes_producto_tamano_key unique (producto_id, tamaño);
    end if;
end
$$;

drop index if exists public.productos_slug_idx;
drop index if exists public.variantes_producto_idx;
