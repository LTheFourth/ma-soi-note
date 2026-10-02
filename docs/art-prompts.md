# Role artwork — generation kit

Every image in `src/art/` was generated for this project and is owned by it.
No third-party card art (Agrou, Bezier Games, or any other) is copied, traced, or
redistributed. Role *names* are short factual labels and are free to use.

## How the artwork pipeline works

```
src/art/portraits/<id>.png    1500x1500 originals, NOT committed (~166 MB)
            |
            |  python scripts/build-art.py     (needs Pillow)
            v
src/art/<id>.webp             256x256, ~3 KB each, committed and shipped
```

`src/lib/art.js` picks up everything in `src/art/` at build time, so after running
the script the new art is simply there. Nothing else to wire.

### Replacing or adding one role

1. Drop the new 1500x1500 PNG into `src/art/portraits/` named exactly `<art-id>.png`.
2. Run `python scripts/build-art.py`.
3. Run `npm test` — it fails if an id has no file or a file has no planned id.
4. Commit and push.

File precedence is `.webp` > `.png` > `.svg` for the same id, so a committed
`.webp` always wins. An id with no file at all falls back to the role's initial on
a coloured disc, which keeps the app working while art is missing.

### Keep the originals safe

`src/art/portraits/` is gitignored because 42 files at ~4 MB would bloat the repo
permanently. The script only goes one way — it cannot rebuild a 1500x1500 original
from a 256px WebP. Back that folder up somewhere outside the repo.

## Rules that keep the set looking like one deck

- Use the **locked preamble below verbatim** as the first sentence of every prompt.
  Only the subject sentence changes. This is the main defence against style drift.
- Same model, same settings, same seed family for the whole run.
- 1:1 aspect, 512x512 or larger, then downscale to 256x256 WebP.
- Bust / shoulders-up, centred, plain dark background, no text, no frame.
- Generate the whole set, lay the results out as one contact sheet, and re-roll the
  outliers **before** committing. Judge the set, never a single image.

## Locked style preamble

```
Flat painted character bust portrait, dark-fantasy village folk-horror, muted desaturated palette, single warm rim light from upper left, centred square composition, shoulders-up, plain dark circular background, thick confident brush shapes, no text, no border, no frame.
```

## Prompts

Each prompt is the preamble above followed by the subject line.

### Werewolf team

| Art id | Subject line |
|---|---|
| `werewolf` | a snarling grey wolf-man with yellow eyes and bared fangs, coarse fur, torn peasant shirt |
| `dire-wolf` | a huge black alpha wolf-man with a scarred muzzle, bone necklace and a crown of antlers |
| `wolf-cub` | a young half-transformed boy, one wolf ear and amber eyes, frightened and feral |
| `big-bad-wolf` | an enormous bloated wolf beast, jaws wide, drool and splintered teeth |
| `lone-wolf` | a solitary lean wolf-man in a tattered grey travelling cloak, head turned away |
| `sorceress` | a hooded woman with glowing violet eyes and a wolf-shaped shadow behind her |
| `minion` | a hunched servant in a ragged brown hood clutching a wolf-fang amulet |
| `cult-leader` | a robed preacher with a wolf-skull mask raised on his head, arms open |

### Village team

| Art id | Subject line |
|---|---|
| `villager` | a plain middle-aged peasant in a linen shirt holding a pitchfork |
| `seer` | a woman in a star-patterned shawl with milk-white blind eyes, cradling a glowing crystal ball |
| `apprentice-seer` | a young girl in a too-large star shawl holding a small dim crystal, uncertain |
| `aura-seer` | a mystic with eyes closed and faint coloured halos drifting around their head |
| `mason` | a stonemason in a leather apron with a chisel and a square-and-compass pendant |
| `bodyguard` | a broad-shouldered guard in a battered iron breastplate holding a round wooden shield |
| `hunter` | a weathered hunter with a longbow across the chest and a quiver of arrows |
| `witch` | an old herbalist holding two small corked vials, one green one red, cauldron smoke behind |
| `spellcaster` | a robed caster with glowing runes circling one raised hand and lips sealed shut |
| `village-idiot` | a grinning simpleton in a lopsided jester hood with straw in his hair |
| `mayor` | a portly official in a red sash and chain of office, holding a rolled decree |
| `prince` | a young noble in a fine blue doublet with a thin silver circlet |
| `priest` | a village priest in a dark cassock holding a wooden cross and a censer |
| `pacifist` | a gentle figure in white holding an olive branch, hands open and empty |
| `martyr` | a kneeling figure in torn robes with arms spread and a faint halo of light |
| `beholder` | a quiet watcher peering from behind a wooden shutter, one eye visible |
| `old-man` | a white-bearded village elder leaning on a gnarled walking staff |
| `old-hag` | a crooked old woman with wild grey hair and a knowing crooked grin |
| `cursed` | a pale villager with one wolf-yellow eye and dark veins creeping up the neck |
| `diseased` | a sickly villager with a plague cloth over the mouth and feverish eyes |
| `drunk` | a red-nosed villager slumped sideways clutching a clay jug |
| `ghost` | a translucent pale figure in a burial shroud, edges dissolving into mist |
| `lycan` | a villager mid-transformation, human face with wolf ears and lengthening claws |
| `private-investigator` | a sharp-eyed figure in a long coat holding a brass magnifying glass |
| `troublemaker` | a smirking youth tossing a stone from hand to hand, sleeves rolled up |
| `cupid` | a mischievous winged archer with a small bow and a rose-fletched arrow |
| `doppelganger` | a faceless figure whose blank features are half-forming into a copy of another face |

### Independent and utility

| Art id | Subject line |
|---|---|
| `tanner` | a grim leather-worker in a stained apron with hollow resigned eyes |
| `hoodlum` | a scarred thug in a dark hood with brass knuckles and a broken nose |
| `vampire` | a gaunt pale aristocrat with red eyes and a high black collar, fangs just visible |
| `bogeyman` | a tall shadow-shrouded figure with long thin fingers and two pale pinpoint eyes |
| `magician` | a showman in a worn top hat with cards fanned in one gloved hand |
| `thing` | an indistinct shifting silhouette of no fixed shape, suggestion of many limbs |
| `unknown` | a plain featureless hooded silhouette, no face, neutral grey |

Total: 42 art ids.

## Checklist before committing a batch

- [ ] Every file is square and 256x256
- [ ] Every filename exactly matches an art id above
- [ ] Contact sheet reviewed; outliers re-rolled
- [ ] `npm run build` run and the bundle size checked (target: under ~700 KB of art)