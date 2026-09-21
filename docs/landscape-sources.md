# Atal Tunnel: geography and visual references

## Mapped location

The arrival zoom targets the southern endpoint of OpenStreetMap's Atal Tunnel
road, **32.3632307° N, 77.1331123° E**. This is not the tunnel-centre coordinate
from an encyclopedia, or the nearby information-board pin.

- [OSM node 4082425413](https://www.openstreetmap.org/node/4082425413), endpoint of
  [tunnel way 406136392](https://www.openstreetmap.org/way/406136392).
- Retrieved using [the OSM map API](https://www.openstreetmap.org/api/0.6/map?bbox=77.130,32.362,77.139,32.368).
- Map data © OpenStreetMap contributors, [ODbL](https://www.openstreetmap.org/copyright).
- Coordinates describe the mapped entrance, not a new survey or an accuracy guarantee.

### India boundary depiction

The owner requested the complete boundary depiction recognized by the Government
of India. The earlier Natural Earth India polygon is no longer used for India.
The replacement includes the full Indian territorial depiction, including
Jammu and Kashmir, Ladakh, Aksai Chin, the Shaksgam region, Arunachal Pradesh,
Lakshadweep and the Andaman and Nicobar Islands.

- Boundary reference: [Survey of India, Government of India — Outline Maps](https://surveyofindia.gov.in/pages/outline-maps-of-india).
- Rendered mainland/island data: [DataMeet's CC0 India composite](https://github.com/datameet/maps/blob/5ed214bf77788f99066e3542cccd4a52cb042896/Country/india-composite.geojson).
  Its [dataset documentation](https://github.com/datameet/maps/blob/master/Country/README.md)
  explicitly describes the inclusion of disputed territories in accordance with
  the official Indian boundary. This is an open-data cartographic rendering, not
  a map issued, endorsed or newly certified by the Government of India.
- More detailed Lakshadweep coastlines: [OpenStreetMap contributors via DataMeet](https://github.com/datameet/maps/blob/5ecfea205eb7593f6b57253514069e38b94be559/Country/india-osm.geojson),
  [ODbL](https://www.openstreetmap.org/copyright). The SVG is a produced map;
  source geometry remains available at that link under its original licence.
- Neighbouring-country context only: [Natural Earth 1:110m country data](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson),
  [public domain](https://www.naturalearthdata.com/about/terms-of-use/).

The country outline is projected into the same Mercator-style coordinate frame
as the portal pin, with subpixel line simplification for the opening view. Islands
are retained and labelled. It is not a cadastral or legal boundary survey.

Survey of India's [copyright policy](https://surveyofindia.gov.in/pages/copyright-policy)
requires written permission for reproducing its website material. Its downloaded
outline was inspected as a reference, **not republished**. The website instead
ships the independently licensed datasets identified above.

Downloaded source SHA-256 values:

- CC0 composite: `5e44c39b18aa8fe57267d8018fa4ad4a10eaa3aa4cb7cb7382a1813ef8eb8c53`
- OSM-derived outline: `10bcf1649f16c16fcbd9cba5a4bc355c03fdad820f35084b49062130a1e55aa2`

Research used public Survey of India pages and DataMeet's raw dataset documentation.
The search-engine result page was not useful; the official pages and repository
sources supplied the evidence. No browser escalation or permission-restricted
government asset is required at visitor runtime.

## Photo references

The south entrance's sloped timber fascia, lettering, stone-like pillars, concrete
retaining structures and forested slope are modelled from:

- [Atal Tunnel Entrance (South Portal), Manali](https://commons.wikimedia.org/wiki/File:Atal_Tunnel_Entrance_(South_Portal),_Manali.jpg),
  Tanvi.sharmaaa, **CC BY-SA 4.0**. The retained reference WebP is a resized,
  recompressed copy, under the same [CC BY-SA 4.0 licence](https://creativecommons.org/licenses/by-sa/4.0/).
  It is no longer displayed as the opening hero or a rendering fallback.
- [Atal Tunnel vrtmrgmpksk (2)](https://commons.wikimedia.org/wiki/File:Atal_Tunnel_vrtmrgmpksk_(2).jpg),
  Vinayaraj, CC BY-SA 4.0. Interior lighting, wall lining and lane-divider reference;
  this photograph is not included in the website's assets.

The scene is an authored, photo-referenced 3D reconstruction, **not a laser scan,
photogrammetric digital twin or survey-accurate terrain model**. Conifers, rocks,
snow-lined distant ridges and small distant birds establish the Himalayan setting;
their individual positions and wildlife movements are illustrative. It does not
claim that a particular animal was observed at the location.

The existing short sensor demonstration is deliberately compressed: the real
tunnel is [9.02 km long](https://en.wikipedia.org/wiki/Atal_Tunnel). The short demo's
road, exit arrangement and timing are not a full-scale reconstruction of that
journey. Neither the browser estimator nor these visuals run SETU's Android model.

## Surface textures

The following [Poly Haven](https://polyhaven.com/license) assets are **CC0**:

- [Rocky Terrain 02](https://polyhaven.com/a/rocky_terrain_02)
- [Aerial Grass Rock](https://polyhaven.com/a/aerial_grass_rock)
- [Asphalt 02](https://polyhaven.com/a/asphalt_02)
- [Concrete Wall 001](https://polyhaven.com/a/concrete_wall_001)

Diffuse, OpenGL normal and roughness maps were obtained from the public Poly Haven
API's 1k JPG variants, checked against the API's file digests, then recompressed
to WebP. They are self-hosted under `assets/landscape`; visitors do not contact
Poly Haven, Wikimedia or OpenStreetMap to play the scene.

The instanced tree cards use a cropped and recompressed
[Fir Tree 01 asset render](https://cdn.polyhaven.com/asset_img/primary/fir_tree_01.png?width=768)
from [Poly Haven's CC0 Fir Tree 01](https://polyhaven.com/a/fir_tree_01).
They are lightweight intersecting foliage cards, not a downloaded high-poly tree
mesh. Car, portal, terrain, birds and mist are authored geometry/procedural assets.
