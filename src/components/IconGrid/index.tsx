import * as React from "react";
import path from "path";
import r6operators from "r6operators";
import { Search } from "react-feather";
import { Operator } from "r6operators/src/modules/operator";
import Dropdown, { Group, Option } from "react-dropdown-now";
import IconTile from "~components/IconTile";
import { IIcon } from "~components/Icon";

import "./icongrid.scss";

// interfaces
interface IIconGridProps {
  children?: React.ReactNode;
}
interface IIconGridState {
  inputValue: string;
  items: Array<Operator>;
  filter: string;
}
interface IICONSMap {
  [name: string]: IIcon;
}

// convert object to Array<Operator>
const initialItems: Array<Operator> = Object.values(r6operators);

// use sets for filtering
const roleFilter = new Set();
const unitFilter = new Set();

// iterate over initialItems to get roles and add them to the sets
for (const op of initialItems) {
  roleFilter.add(op.role);
  unitFilter.add(op.unit);
}

// create filter object for dropdown
const dropdownFilters = [
  "None",
  {
    type: "group",
    name: "Role",
    items: [...roleFilter].sort()
  } as Group,
  {
    type: "group",
    name: "Unit",
    items: [...unitFilter].sort()
  } as Group
];

// create GLYPHS object for svg sprite loader
const requestIcons = require.context("r6operators/lib/icons/svg", true, /\.svg$/);
const ICONS: IICONSMap = requestIcons.keys().reduce((glyphs, key) => {
  const filename = path.basename(key, ".svg");
  return { ...glyphs, [filename]: requestIcons(key).default };
}, {});

export default class IconGrid extends React.Component<IIconGridProps, IIconGridState> {
  constructor(props: IIconGridProps) {
    super(props);
    // initial state
    this.state = {
      inputValue: "",
      items: initialItems,
      filter: ""
    };
    // bind functions
    this.updateInputValue = this.updateInputValue.bind(this);
    this.setFilter = this.setFilter.bind(this);
  }

  updateInputValue(event: React.ChangeEvent<HTMLInputElement>): void {
    const updatedList = initialItems.filter(x =>
      x.name
        .toString()
        .toLowerCase()
        .includes(event.target.value.toString().toLowerCase())
    );
    this.setState({ inputValue: event.target.value, filter: "", items: updatedList });
  }

  setFilter(option: Option): void {
    if (option.value === "None") {
      // set empty state when "None" is selected
      this.setState({ inputValue: "", filter: option.value, items: initialItems });
    } else {
      const updatedList = initialItems.filter(
        x =>
          x.role.toString().toLowerCase() === option.value.toString().toLowerCase() ||
          x.unit.toString().toLowerCase() === option.value.toString().toLowerCase()
      );
      this.setState({ inputValue: "", filter: option.value, items: updatedList });
    }
  }
  render(): JSX.Element {
    return (
      <div className="icongrid">
        <div className="icongrid__filters">
          <div className="icongrid__search">
            <Search />
            <input
              placeholder="Search icons"
              value={this.state.inputValue}
              onChange={this.updateInputValue}
            />
          </div>
          <Dropdown
            className="icongrid__dropdown"
            options={dropdownFilters}
            onChange={this.setFilter}
            value={this.state.filter}
            placeholder="Select an option"
          />
        </div>
        <div
          className={
            this.state.items.length === 0 ? "icongrid__container is-empty" : "icongrid__container"
          }
        >
          {this.state.items.map(x => (
            <IconTile key={x.id} object={x} icon={ICONS[x.id]} />
          ))}
          {this.state.items.length === 0 ? (
            <div className="icongrid__empty">
              No results found for {this.state.inputValue || this.state.filter}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
