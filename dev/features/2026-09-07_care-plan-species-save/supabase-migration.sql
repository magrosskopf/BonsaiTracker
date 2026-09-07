create or replace function public.patch_owned_bonsai(
  p_actor_user_id uuid,
  p_bonsai_id integer,
  p_patch jsonb,
  p_images_to_add text[] default array[]::text[],
  p_images_to_remove text[] default array[]::text[]
)
returns public.bonsais
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.bonsais%rowtype;
  v_updated public.bonsais%rowtype;
  v_images text[];
begin
  select *
    into v_existing
    from public.bonsais
    where id = p_bonsai_id
      and user_id = p_actor_user_id
    for update;

  if not found then
    raise exception 'Bonsai not found';
  end if;

  select coalesce(array_agg(image_path order by ordinality), array[]::text[])
    into v_images
    from unnest(coalesce(v_existing.images, array[]::text[])) with ordinality as existing_images(image_path, ordinality)
    where not image_path = any(coalesce(p_images_to_remove, array[]::text[]));

  v_images := v_images || coalesce(p_images_to_add, array[]::text[]);

  update public.bonsais
    set
      name = case when p_patch ? 'name' then p_patch->>'name' else name end,
      species = case when p_patch ? 'species' then p_patch->>'species' else species end,
      care_plan_species_id = case when p_patch ? 'care_plan_species_id' then p_patch->>'care_plan_species_id' else care_plan_species_id end,
      latin_name = case when p_patch ? 'latin_name' then p_patch->>'latin_name' else latin_name end,
      location = case when p_patch ? 'location' then p_patch->>'location' else location end,
      indoor_outdoor = case when p_patch ? 'indoor_outdoor' then (p_patch->>'indoor_outdoor')::public.indoor_outdoor_enum else indoor_outdoor end,
      age = case when p_patch ? 'age' then (p_patch->>'age')::integer else age end,
      height_cm = case when p_patch ? 'height_cm' then (p_patch->>'height_cm')::integer else height_cm end,
      width_cm = case when p_patch ? 'width_cm' then (p_patch->>'width_cm')::integer else width_cm end,
      trunk_diameter_mm = case when p_patch ? 'trunk_diameter_mm' then (p_patch->>'trunk_diameter_mm')::integer else trunk_diameter_mm end,
      style = case when p_patch ? 'style' then p_patch->>'style' else style end,
      custom_style = case when p_patch ? 'custom_style' then p_patch->>'custom_style' else custom_style end,
      owned_since = case when p_patch ? 'owned_since' then (p_patch->>'owned_since')::timestamptz else owned_since end,
      acquired_from = case when p_patch ? 'acquired_from' then p_patch->>'acquired_from' else acquired_from end,
      purchase_price_cents = case when p_patch ? 'purchase_price_cents' then (p_patch->>'purchase_price_cents')::integer else purchase_price_cents end,
      health_status = case when p_patch ? 'health_status' then (p_patch->>'health_status')::public.health_status_enum else health_status end,
      development_stage = case when p_patch ? 'development_stage' then (p_patch->>'development_stage')::public.development_stage_enum else development_stage end,
      last_repot_date = case when p_patch ? 'last_repot_date' then (p_patch->>'last_repot_date')::timestamptz else last_repot_date end,
      next_repot_due = case when p_patch ? 'next_repot_due' then (p_patch->>'next_repot_due')::timestamptz else next_repot_due end,
      winter_hardiness = case when p_patch ? 'winter_hardiness' then (p_patch->>'winter_hardiness')::public.winter_hardiness_enum else winter_hardiness end,
      sun_exposure = case when p_patch ? 'sun_exposure' then (p_patch->>'sun_exposure')::public.sun_exposure_enum else sun_exposure end,
      pot_type = case when p_patch ? 'pot_type' then p_patch->>'pot_type' else pot_type end,
      pot_color = case when p_patch ? 'pot_color' then p_patch->>'pot_color' else pot_color end,
      watering_notes = case when p_patch ? 'watering_notes' then p_patch->>'watering_notes' else watering_notes end,
      fertilizing_notes = case when p_patch ? 'fertilizing_notes' then p_patch->>'fertilizing_notes' else fertilizing_notes end,
      pruning_notes = case when p_patch ? 'pruning_notes' then p_patch->>'pruning_notes' else pruning_notes end,
      wiring_notes = case when p_patch ? 'wiring_notes' then p_patch->>'wiring_notes' else wiring_notes end,
      notes = case when p_patch ? 'notes' then p_patch->>'notes' else notes end,
      images = case when p_patch ? 'images' then coalesce(array(select jsonb_array_elements_text(p_patch->'images')), array[]::text[]) else v_images end,
      updated_at = now()
    where id = p_bonsai_id
      and user_id = p_actor_user_id
    returning *
    into v_updated;

  return v_updated;
end;
$$;
