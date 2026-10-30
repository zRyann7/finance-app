-- Bucket de avatares: limites no servidor e policies por dono.
--
-- Antes: as policies só checavam bucket_id = 'avatars', então qualquer usuário logado podia
-- sobrescrever ou apagar o avatar de outro, e o bucket não tinha limite de tamanho/tipo.
-- O frontend grava em <user_id>/<timestamp>.<ext>; a policy exige que a 1ª pasta seja o auth.uid().

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Atualização para usuários autenticados 1oj01fe_0" on storage.objects;
drop policy if exists "Atualização para usuários autenticados 1oj01fe_1" on storage.objects;
drop policy if exists "Atualização para usuários autenticados 1oj01fe_2" on storage.objects;
drop policy if exists "Upload para usuários autenticados 1oj01fe_0" on storage.objects;
-- Bucket público: a URL pública não depende de policy; sem esta, ninguém consegue LISTAR os arquivos.
drop policy if exists "Leitura pública de avatares 1oj01fe_0" on storage.objects;

drop policy if exists "avatars_insert_own_folder" on storage.objects;
drop policy if exists "avatars_update_own_folder" on storage.objects;
drop policy if exists "avatars_delete_own_folder" on storage.objects;

create policy "avatars_insert_own_folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars_update_own_folder" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars_delete_own_folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
