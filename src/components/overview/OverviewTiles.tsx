import type { OverviewTile } from "@app-types/overview.types";

interface OverviewTilesProps {
  tiles: OverviewTile[];
}

export function OverviewTiles({ tiles }: OverviewTilesProps) {
  return (
    <div className="ov-tiles">
      {tiles.map((tile) => (
        <div className="ov-tile" key={tile.label}>
          <span>{tile.label}</span>
          <strong>{tile.value}</strong>
          <small>{tile.sub}</small>
        </div>
      ))}
    </div>
  );
}
