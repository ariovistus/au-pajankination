This is a collection of paginated widgets I built for use with odata-like apis.

# setup

```
npm install au-pajankination
```

for requirejs cli, add to aurelia.json

```
  {
      "name": "au-pajankination",
      "main": "index",
      "path": "../node_modules/au-pajankination/dist",
      "resources": [
          "**/*.html",
          "**/*.css"
      ]
  }
```

to your main add

```
    .plugin(PLATFORM.moduleName("au-pajankination"))
```

this will add all components as global resources. If you don't want that, instead use

```
    .plugin(PLATFORM.moduleName("au-pajankination"), c => {
      c.noGlobalResources = true;
    })
```

# paj-combobox
This is a combobox meant for use with potentially infinite length odata-like apis. It takes inspiration (and css) from select2.

It implements infinte scrolling, and works best with an index api, e.g. for an item

```
{
    id: 778,
    name: "Mumphrey",
}
```

you have access to an api such as

```
GET /items/778/indexOf
```

that returns the item's index in the stream.


simple example:

```
  <paj-combobox data-source.bind="dataSource" selected-id.bind="item" width: "300px">
    <template replace-part="item-template">
      <div>
        <b> ${item.name} </b>
      </div>
    </template>
    <template replace-part="selected-template">
        <i> ${item.name} </i>
    </template>
  </paj-combobox>
```

`dataSource` needs to implement IComboboxDataSource

## custom templates

TODO

# paj-grid

this is a simple paginated grid.

simple example:

```
  <paj-grid data-source.bind="dataSource">
    <template replace-part="header">
      <div class="div-tr">
        <div class="div-th">
          Field 1
        </div>
        <div class="div-th">
          Field 2
        </div>
      </div>
    </template>
    <template replace-part="body">
      <div class="div-tr" repeat.for="row of rows">
        <div class="div-td">
          ${row.field1}
        </div>
        <div class="div-td">
          ${row.field2}
        </div>
      </div>
    </template>
  </paj-grid>
```

`dataSource` needs to be an implementation of IGridDataSource. If you are wrapping an odata api, "au-pajankination/grid/odata-data-source" has some minimal additional conveniences.

## sort-header

use this to add sorting functionality to a column:

```
      <paj-grid data-source.bind="dataSource" view-model.ref="grid">
        <template replace-part="header">
          <div class="div-tr">
            <sort-header column="field1" grid.bind="grid">Field 1</sort-header>
          </div>
        </template>
      </paj-grid>
```


`paj-grid` has a 3 state sort cycle: sort ascending, sort descending, not sorted (or sorted by default column). Your data source needs to do something with the orderby parameter!


## custom template

The default html template for `paj-grid` uses bootstrap 3 and font-awesome css.

If you don't want that, then TODO
