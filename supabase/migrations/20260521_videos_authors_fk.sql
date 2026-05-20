-- App helper RPCs for the normalized video schema.
-- The app reads videos.author_name directly and derives covers from YouTube thumbnails.

alter table public.authors
  drop constraint if exists authors_image_filename_key;

alter table public.authors
  drop column if exists image_url;

create or replace function public.video_distinct_languages()
returns table(language_code text)
language sql
stable
security invoker
as $$
  select distinct trim(v.language_code) as language_code
  from public.videos v
  where v.language_code is not null
    and trim(v.language_code) <> ''
  order by 1;
$$;

create or replace function public.video_distinct_topics(p_lang text default null)
returns table(topic text)
language sql
stable
security invoker
as $$
  select distinct trim(split_topic.topic) as topic
  from public.videos v
  cross join lateral regexp_split_to_table(coalesce(v.video_topic, ''), ',') as split_topic(topic)
  where (p_lang is null or v.language_code = p_lang)
    and trim(split_topic.topic) <> ''
  order by 1;
$$;

create or replace function public.video_distinct_authors(p_lang text default null)
returns table(author text)
language sql
stable
security invoker
as $$
  select distinct trim(v.author_name) as author
  from public.videos v
  where (p_lang is null or v.language_code = p_lang)
    and v.author_name is not null
    and trim(v.author_name) <> ''
  order by 1;
$$;
