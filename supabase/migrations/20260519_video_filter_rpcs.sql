-- Migration: RPCs für effiziente Video-Filter
--
-- Statt jedes Mal die ganze Tabelle zu laden, geben wir distincte Werte
-- direkt aus Postgres zurück. Skaliert auf >10k Videos problemlos.
--
-- Anwendung im Client:
--   const { data } = await supabase.rpc('video_distinct_languages');
--   const { data } = await supabase.rpc('video_distinct_topics',  { p_lang: 'de' });
--   const { data } = await supabase.rpc('video_distinct_authors', { p_lang: 'de' });
--
-- HINWEIS zum Tabellennamen: Die Tabelle heißt aktuell weiterhin `podcasts`
-- (Legacy aus dem alten Podcast-Projekt). Wenn ihr sie umbenennt, einfach
-- die Function-Bodies anpassen.
--
-- WICHTIG: `podcast_topic` ist in der DB oft eine kommaseparierte Liste
-- ("Aqida, Geschichte") oder ein JSON-Array. Wir splitten zur Sicherheit
-- bei `,` und trimmen White-Space.

create or replace function public.video_distinct_languages()
returns table(language_code text)
language sql
stable
security invoker
as $$
  select distinct trim(p.language_code) as language_code
  from public.podcasts p
  where p.language_code is not null
    and trim(p.language_code) <> ''
  order by 1;
$$;

create or replace function public.video_distinct_topics(p_lang text default null)
returns table(topic text)
language sql
stable
security invoker
as $$
  with rows as (
    select p.podcast_topic
    from public.podcasts p
    where (p_lang is null or p.language_code = p_lang)
      and p.podcast_topic is not null
      and trim(p.podcast_topic) <> ''
  ),
  -- JSON-Arrays handhaben (e.g. ["Aqida","Fiqh"])
  expanded as (
    select case
             when left(trim(podcast_topic), 1) = '['
               then trim(elem)
             else trim(unnest_csv)
           end as topic
    from (
      select
        podcast_topic,
        unnest(string_to_array(podcast_topic, ',')) as unnest_csv,
        null::text as elem
      from rows
      where left(trim(podcast_topic), 1) <> '['

      union all

      select
        podcast_topic,
        null::text as unnest_csv,
        jsonb_array_elements_text(podcast_topic::jsonb) as elem
      from rows
      where left(trim(podcast_topic), 1) = '['
    ) flat
  )
  select distinct topic
  from expanded
  where topic is not null and topic <> ''
  order by 1;
$$;

create or replace function public.video_distinct_authors(p_lang text default null)
returns table(author text)
language sql
stable
security invoker
as $$
  select distinct trim(p.podcast_author) as author
  from public.podcasts p
  where (p_lang is null or p.language_code = p_lang)
    and p.podcast_author is not null
    and trim(p.podcast_author) <> ''
  order by 1;
$$;

-- RLS-bewusst: SECURITY INVOKER, damit die existierenden RLS-Policies greifen.
-- (Anonymer Zugriff funktioniert wie heute auch.)

grant execute on function public.video_distinct_languages()        to anon, authenticated;
grant execute on function public.video_distinct_topics(text)       to anon, authenticated;
grant execute on function public.video_distinct_authors(text)      to anon, authenticated;
