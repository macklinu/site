import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Coffee,
  HeartHandshake,
  Landmark,
  Leaf,
  LocateFixed,
  TrainFront,
  MapPinned,
  Palette,
  ShoppingBag,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import * as maplibregl from "maplibre-gl";
import { createRoot, type Root } from "react-dom/client";

type PlaceKind =
  | "food"
  | "coffee"
  | "books"
  | "art"
  | "nature"
  | "shopping"
  | "community"
  | "sights"
  | "transit";
type PlaceFilter = "all" | PlaceKind;
type LocationState = "idle" | "locating" | "located" | "error";

export interface SanFranciscoPlace {
  kind: "place";
  slug: string;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  appleMapsUrl: string;
  category: PlaceKind;
  tags: string[];
}

interface SanFranciscoNeighborhood {
  kind: "neighborhood";
  title: string;
  description: string;
  boundary: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
}

type SanFranciscoMapEntry = SanFranciscoPlace | SanFranciscoNeighborhood;

interface Props {
  places: SanFranciscoMapEntry[];
}

interface MarkerEntry {
  element: HTMLButtonElement;
  iconRoot: Root;
  kind: PlaceKind;
  slug: string;
  marker: maplibregl.Marker;
}

const attribution = "Sources: Esri, DeLorme, HERE, MapmyIndia";

function createMapStyle(tone: "Light" | "Dark"): maplibregl.StyleSpecification {
  return {
    version: 8,
    sources: {
      esriBase: {
        type: "raster",
        tiles: [
          `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${tone}_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
        ],
        tileSize: 256,
        attribution,
      },
      esriReference: {
        type: "raster",
        tiles: [
          `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${tone}_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
        ],
        tileSize: 256,
        attribution,
      },
    },
    layers: [
      { id: "esri-base", type: "raster", source: "esriBase" },
      { id: "esri-reference", type: "raster", source: "esriReference" },
    ],
  };
}

const lightMapStyle = createMapStyle("Light");
const darkMapStyle = createMapStyle("Dark");
const sanFranciscoCenter: [number, number] = [-122.443, 37.77];
const sanFranciscoZoom = 11;
const initialMaxZoom = 12;
const mapTransitionDuration = 800;

const popupOptions = {
  closeButton: true,
  closeOnClick: true,
  offset: 20,
  padding: { top: 12, right: 12, bottom: 12, left: 12 },
} satisfies maplibregl.PopupOptions;

function styleForCurrentTheme() {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return root.dataset.theme === "dark" || (!root.dataset.theme && prefersDark)
    ? darkMapStyle
    : lightMapStyle;
}

const filterDefinitions: ReadonlyArray<{ kind: PlaceFilter; label: string }> = [
  { kind: "all", label: "All" },
  { kind: "food", label: "Food" },
  { kind: "coffee", label: "Coffee" },
  { kind: "books", label: "Books" },
  { kind: "art", label: "Art" },
  { kind: "nature", label: "Nature" },
  { kind: "shopping", label: "Shopping" },
  { kind: "community", label: "Community" },
  { kind: "sights", label: "Sights" },
  { kind: "transit", label: "Transit" },
];

const markerIcons: Record<PlaceKind, LucideIcon> = {
  food: Utensils,
  coffee: Coffee,
  books: BookOpen,
  art: Palette,
  nature: Leaf,
  shopping: ShoppingBag,
  community: HeartHandshake,
  sights: Landmark,
  transit: TrainFront,
};

function createPopupContent(place: SanFranciscoPlace) {
  const content = document.createElement("article");
  content.className = "sf-map-popup";

  const title = document.createElement("h3");
  title.className = "sf-map-popup__title";
  title.textContent = place.title;
  content.append(title);

  const descriptionText = place.description.trim();
  if (descriptionText) {
    const description = document.createElement("p");
    description.className = "sf-map-popup__description";
    description.textContent = descriptionText;
    content.append(description);
  }

  const appleMapsLink = document.createElement("a");
  appleMapsLink.className = "sf-map-popup__link";
  appleMapsLink.href = place.appleMapsUrl;
  appleMapsLink.target = "_blank";
  appleMapsLink.rel = "noopener noreferrer";
  appleMapsLink.textContent = "Apple Maps ↗";
  content.append(appleMapsLink);

  return content;
}

function createNeighborhoodPopupContent(neighborhood: SanFranciscoNeighborhood) {
  const content = document.createElement("article");
  content.className = "sf-map-popup";

  const title = document.createElement("h3");
  title.className = "sf-map-popup__title";
  title.textContent = neighborhood.title;
  content.append(title);

  const description = document.createElement("p");
  description.className = "sf-map-popup__description";
  description.textContent = neighborhood.description;
  content.append(description);

  return content;
}

export default function SanFranciscoMap({ places }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<MarkerEntry[]>([]);
  const activePopupRef = useRef<maplibregl.Popup | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<PlaceFilter>("all");
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const pointPlaces = useMemo(
    () => places.filter((place): place is SanFranciscoPlace => place.kind === "place"),
    [places],
  );
  const neighborhoods = useMemo(
    () =>
      places.filter((place): place is SanFranciscoNeighborhood => place.kind === "neighborhood"),
    [places],
  );

  const counts = useMemo(() => {
    const values: Record<PlaceKind, number> = {
      food: 0,
      coffee: 0,
      books: 0,
      art: 0,
      nature: 0,
      shopping: 0,
      community: 0,
      sights: 0,
      transit: 0,
    };

    for (const place of pointPlaces) {
      values[place.category] += 1;
    }

    return values;
  }, [pointPlaces]);

  useEffect(() => {
    if (!container.current || pointPlaces.length === 0) return;

    const map = new maplibregl.Map({
      attributionControl: false,
      container: container.current,
      style: styleForCurrentTheme(),
      center: sanFranciscoCenter,
      zoom: sanFranciscoZoom,
      cooperativeGestures: true,
    });
    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    const bounds = new maplibregl.LngLatBounds();
    mapRef.current = map;
    let applyingUrlSelection = false;
    const selectedSlug = () => new URL(window.location.href).searchParams.get("place");
    const updateUrl = (slug: string | null) => {
      const url = new URL(window.location.href);
      if (slug) url.searchParams.set("place", slug);
      else url.searchParams.delete("place");
      window.history.replaceState(null, "", url);
    };
    const updateSelectedMarker = (slug: string | null) => {
      for (const entry of markersRef.current) {
        entry.element.dataset.selected = String(entry.slug === slug);
      }
    };
    for (const neighborhood of neighborhoods) {
      for (const ring of neighborhood.boundary.coordinates) {
        for (const coordinate of ring) bounds.extend([coordinate[0], coordinate[1]]);
      }
    }
    const neighborhoodOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const neighborhoodPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    neighborhoodOverlay.classList.add("absolute", "inset-0");
    neighborhoodOverlay.style.pointerEvents = "auto";
    neighborhoodOverlay.style.zIndex = "1";
    neighborhoodPath.style.pointerEvents = "visiblePaint";
    neighborhoodPath.style.cursor = "pointer";
    neighborhoodPath.setAttribute("role", "button");
    neighborhoodPath.setAttribute("tabindex", "0");
    neighborhoodPath.setAttribute("aria-label", "View Haight-Ashbury neighborhood");
    neighborhoodPath.setAttribute("fill", "#49d158");
    neighborhoodPath.setAttribute("fill-opacity", "0.1");
    neighborhoodPath.setAttribute("stroke", "var(--green-ink)");
    neighborhoodPath.setAttribute("stroke-width", "2");
    neighborhoodOverlay.append(neighborhoodPath);
    map.getCanvasContainer().append(neighborhoodOverlay);

    const renderNeighborhoodOverlay = () => {
      const canvas = map.getCanvas();
      neighborhoodOverlay.setAttribute(
        "viewBox",
        `0 0 ${canvas.clientWidth} ${canvas.clientHeight}`,
      );
      neighborhoodPath.setAttribute(
        "d",
        neighborhoods
          .flatMap((neighborhood) => neighborhood.boundary.coordinates)
          .map((ring) => {
            const [first, ...rest] = ring.map((coordinate) =>
              map.project([coordinate[0], coordinate[1]]),
            );
            return `M ${first.x} ${first.y} ${rest.map((point) => `L ${point.x} ${point.y}`).join(" ")} Z`;
          })
          .join(" "),
      );
    };
    map.on("move", renderNeighborhoodOverlay);
    map.on("resize", renderNeighborhoodOverlay);

    const updateMapStyle = () => map.setStyle(styleForCurrentTheme());
    const themeObserver = new MutationObserver(updateMapStyle);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => {
      if (!document.documentElement.dataset.theme) updateMapStyle();
    };
    colorScheme.addEventListener("change", updateSystemTheme);

    const openPopup = (place: SanFranciscoPlace) => {
      const previousPopup = activePopupRef.current;
      activePopupRef.current = null;
      previousPopup?.remove();

      const popup = new maplibregl.Popup(popupOptions)
        .setLngLat([place.longitude, place.latitude])
        .setDOMContent(createPopupContent(place))
        .addTo(map);

      popup.on("close", () => {
        if (activePopupRef.current !== popup) return;

        activePopupRef.current = null;
        updateSelectedMarker(null);
        if (!applyingUrlSelection && selectedSlug() === place.slug) updateUrl(null);
      });
      activePopupRef.current = popup;
      updateSelectedMarker(place.slug);
    };

    const openNeighborhoodPopup = (
      neighborhood: SanFranciscoNeighborhood,
      lngLat: maplibregl.LngLat,
    ) => {
      const previousPopup = activePopupRef.current;
      activePopupRef.current = null;
      previousPopup?.remove();
      updateSelectedMarker(null);
      updateUrl(null);

      const popup = new maplibregl.Popup(popupOptions)
        .setLngLat(lngLat)
        .setDOMContent(createNeighborhoodPopupContent(neighborhood))
        .addTo(map);

      popup.on("close", () => {
        if (activePopupRef.current === popup) activePopupRef.current = null;
      });
      activePopupRef.current = popup;
    };

    if (neighborhoods[0]) {
      neighborhoodPath.addEventListener("click", (event) => {
        event.stopPropagation();
        const bounds = map.getCanvas().getBoundingClientRect();
        openNeighborhoodPopup(
          neighborhoods[0],
          map.unproject([event.clientX - bounds.left, event.clientY - bounds.top]),
        );
      });
      neighborhoodPath.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;

        event.preventDefault();
        const coordinate = neighborhoods[0].boundary.coordinates[0][0];
        openNeighborhoodPopup(neighborhoods[0], map.unproject(map.project(coordinate)));
      });
    }

    markersRef.current = pointPlaces.map((place) => {
      const kind = place.category;
      bounds.extend([place.longitude, place.latitude]);

      const element = document.createElement("button");
      const iconRoot = createRoot(element);
      const Icon = markerIcons[kind];
      element.type = "button";
      element.className = "sf-map-marker";
      element.dataset.kind = kind;
      element.dataset.selected = "false";
      element.setAttribute("aria-label", `View ${place.title}`);
      iconRoot.render(<Icon aria-hidden="true" focusable="false" strokeWidth={2} />);
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        updateUrl(place.slug);
        openPopup(place);
      });

      const marker = new maplibregl.Marker({ element, anchor: "center" })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map);

      return { element, iconRoot, kind, slug: place.slug, marker };
    });

    const selectPlaceFromUrl = () => {
      applyingUrlSelection = true;
      const place = pointPlaces.find((entry) => entry.slug === selectedSlug());

      if (place) openPopup(place);
      else {
        activePopupRef.current?.remove();
        updateSelectedMarker(null);
      }
      applyingUrlSelection = false;
    };
    selectPlaceFromUrl();
    window.addEventListener("popstate", selectPlaceFromUrl);

    const prepareMap = () => {
      map.fitBounds(bounds, {
        padding: { top: 48, right: 32, bottom: 48, left: 32 },
        maxZoom: initialMaxZoom,
        duration: 0,
      });
      renderNeighborhoodOverlay();
    };

    if (map.isStyleLoaded()) prepareMap();
    else map.once("load", prepareMap);

    return () => {
      applyingUrlSelection = true;
      colorScheme.removeEventListener("change", updateSystemTheme);
      themeObserver.disconnect();
      window.removeEventListener("popstate", selectPlaceFromUrl);
      map.off("move", renderNeighborhoodOverlay);
      map.off("resize", renderNeighborhoodOverlay);
      neighborhoodOverlay.remove();
      activePopupRef.current?.remove();
      activePopupRef.current = null;
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      markersRef.current.forEach(({ iconRoot, marker }) => {
        iconRoot.unmount();
        marker.remove();
      });
      markersRef.current = [];
      mapRef.current = null;
      map.remove();
    };
  }, [neighborhoods, pointPlaces]);

  useEffect(() => {
    if (selectedFilter !== "all") {
      activePopupRef.current?.remove();
      activePopupRef.current = null;
    }

    for (const { element, kind } of markersRef.current) {
      // MapLibre owns marker elements outside React's render tree.
      // oxlint-disable-next-line react/immutability
      element.hidden = selectedFilter !== "all" && kind !== selectedFilter;
    }
  }, [selectedFilter]);

  const resetMap = () => {
    mapRef.current?.easeTo({
      center: sanFranciscoCenter,
      zoom: sanFranciscoZoom,
      duration: mapTransitionDuration,
      essential: true,
    });
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      setLocationState("error");
      return;
    }

    setLocationState("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const map = mapRef.current;
        if (!map) return;

        userMarkerRef.current?.remove();
        const element = document.createElement("span");
        element.className = "sf-map-user-marker";
        element.setAttribute("role", "img");
        element.setAttribute("aria-label", "Your location");
        userMarkerRef.current = new maplibregl.Marker({ element })
          .setLngLat([coords.longitude, coords.latitude])
          .addTo(map);
        map.easeTo({
          center: [coords.longitude, coords.latitude],
          zoom: Math.max(map.getZoom(), 13),
          duration: mapTransitionDuration,
          essential: true,
        });
        setLocationState("located");
      },
      () => setLocationState("error"),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
    );
  };

  // These non-form control groups and live status messages use their correct ARIA roles.
  /* oxlint-disable jsx-a11y/prefer-tag-over-role */
  return (
    <section
      className="sf-map isolate border-2 border-site-ink bg-site-surface"
      aria-label="Map of saved San Francisco places"
    >
      <div className="flex items-center justify-between gap-3 border-b-2 border-site-ink bg-site-paper p-3 handset:items-start">
        <div className="min-w-0 flex-1 handset:hidden">
          <select
            className="box-border h-9 w-full border border-site-ink bg-site-paper px-2 font-mono text-[0.6875rem] leading-none font-semibold tracking-[0.02em] text-site-ink"
            aria-label="Filter places"
            value={selectedFilter}
            onChange={(event) => {
              const filter = filterDefinitions.find(
                ({ kind }) => kind === event.currentTarget.value,
              );
              if (filter) setSelectedFilter(filter.kind);
            }}
          >
            {filterDefinitions.map(({ kind, label }) => {
              const count = kind === "all" ? pointPlaces.length : counts[kind];

              return (
                <option key={kind} value={kind} disabled={kind !== "all" && count === 0}>
                  {label} — {count}
                </option>
              );
            })}
          </select>
        </div>
        <div
          className="hidden flex-wrap gap-1.5 handset:flex"
          role="group"
          aria-label="Filter places"
        >
          {filterDefinitions.map(({ kind, label }) => {
            const count = kind === "all" ? pointPlaces.length : counts[kind];
            const unavailable = kind !== "all" && count === 0;
            const accessibleLabel =
              kind === "all"
                ? `Show all ${count} places`
                : `Show ${count} ${count === 1 ? "place" : "places"} in the ${label} category`;

            return (
              <button
                key={kind}
                type="button"
                className="inline-flex min-h-9 items-center gap-1.5 border border-site-ink bg-site-paper px-2 py-1.5 font-mono text-[0.6875rem] leading-none font-semibold tracking-[0.02em] text-site-ink transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] aria-pressed:bg-site-blue aria-pressed:text-site-paper hover:not-disabled:bg-site-surface aria-pressed:hover:bg-site-blue active:translate-y-px disabled:cursor-not-allowed disabled:border-site-line disabled:text-site-muted"
                aria-label={accessibleLabel}
                aria-pressed={selectedFilter === kind}
                disabled={unavailable}
                onClick={() => setSelectedFilter(kind)}
              >
                {kind !== "all" && (
                  <span
                    className="sf-map__filter-swatch inline-block size-2 shrink-0 shadow-[0_0_0_1px_var(--ink)]"
                    data-kind={kind}
                    aria-hidden="true"
                  />
                )}
                {label}{" "}
                <span className={selectedFilter === kind ? undefined : "text-site-muted"}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div
          className="flex shrink-0 flex-wrap self-start gap-1.5"
          role="group"
          aria-label="Map view"
        >
          <button
            className="grid size-9 place-items-center border border-site-ink bg-site-paper p-0 text-site-ink transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] hover:not-disabled:bg-site-surface active:translate-y-px disabled:cursor-not-allowed disabled:border-site-line disabled:text-site-muted [&_svg]:size-4"
            type="button"
            aria-label="Reset map to San Francisco"
            title="Reset map to San Francisco"
            onClick={resetMap}
          >
            <MapPinned aria-hidden="true" focusable="false" strokeWidth={2} />
          </button>
          <button
            className="grid size-9 place-items-center border border-site-ink bg-site-green p-0 text-site-green-ink transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] hover:not-disabled:bg-site-surface active:translate-y-px disabled:cursor-not-allowed disabled:border-site-line disabled:text-site-muted [&_svg]:size-4"
            type="button"
            aria-busy={locationState === "locating"}
            aria-label={locationState === "locating" ? "Locating you" : "Locate me"}
            title={locationState === "locating" ? "Locating you" : "Locate me"}
            disabled={locationState === "locating"}
            onClick={locateUser}
          >
            <LocateFixed aria-hidden="true" focusable="false" strokeWidth={2} />
          </button>
        </div>
      </div>
      {locationState === "located" && (
        <p
          className="m-0 border-b border-site-line bg-site-paper px-3 py-2 font-mono text-xs leading-[1.35] text-site-muted"
          role="status"
        >
          Your location is shown on the map.
        </p>
      )}
      {locationState === "error" && (
        <p
          className="m-0 border-b border-site-line bg-site-paper px-3 py-2 font-mono text-xs leading-[1.35] text-site-muted"
          role="status"
        >
          Location is unavailable. Check your browser permission and try again.
        </p>
      )}
      <div ref={container} className="min-h-[clamp(25rem,72svh,40rem)]" />
    </section>
  );
  /* oxlint-enable jsx-a11y/prefer-tag-over-role */
}
