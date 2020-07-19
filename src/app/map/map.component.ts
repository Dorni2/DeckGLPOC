import { Component, OnInit } from '@angular/core';
import { loadArcGISModules } from "@deck.gl/arcgis";
import { BitmapLayer, TextLayer, IconLayer } from '@deck.gl/layers';
import { TripsLayer } from "@deck.gl/geo-layers";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  layer;
  allLayers = [];
  graphics = [];

  constructor() {
    this.initDeckLayers();
  }

  ngOnInit(): void {
  }

  setlayer() {
    this.layer.deck.layers = this.allLayers
    console.log(this.layer.deck.layers);
  }

  updatelayer() {
    let iconLayer = this.layer.deck.layers.find(l => l.id.includes('icon-layer'))
    let data = iconLayer.props.data
    let newData = [];
    data.forEach(oldGraphic => {
      newData.push(this.setNewCoord(oldGraphic));
    });

    const ICON_MAPPING = {
      marker: { x: 0, y: 0, width: 512, height: 512, mask: true }
    };

    this.layer.deck.layers = this.layer.deck.layers.filter(l => l !== iconLayer)
    let newIconLayer = new IconLayer({
      id: `icon-layer${Math.random() * 10}`,
      // data: [{ name: 'Colma (COLM)', address: '365 D Street, Colma CA 94014', exits: 4214, coordinates: [34.5, 32] },
      // { name: 'Colma (COLM)', address: '365 D Street, Colma CA 94014', exits: 4214, coordinates: [35, 32] }],
      data: newData,
      pickable: true,
      // iconAtlas and iconMapping are required
      // getIcon: return a string
      iconAtlas: 'https://image.flaticon.com/icons/svg/3075/3075933.svg',
      iconMapping: ICON_MAPPING,
      scaleSize: 15,
      getIcon: d => 'marker',
      getPosition: d => [d.geometry.x, d.geometry.y],
      getSize: d => 50,
      getColor: (d) => [Math.sqrt(d.exits), 140, 0],
    })
    this.layer.deck.layers.push(newIconLayer);

  }

  private setNewCoord(gr) {
    let clonedGraphic = gr.clone();
    clonedGraphic.attributes.old = `[${clonedGraphic.geometry.x},${clonedGraphic.geometry.y}]`
    let _distance = 10000
    var radians = clonedGraphic.attributes.ANGLE * (Math.PI / 180); // Convert angle to radians
    var newX = clonedGraphic.geometry.x + _distance * Math.cos(radians); // calc new X
    var newY = clonedGraphic.geometry.y + _distance * Math.sin(radians); // calc new Y
    var deltaX = newX - clonedGraphic.geometry.x;
    var deltaY = newY - clonedGraphic.geometry.y;
    // clonedGraphic.geometry.x = deltaX
    // clonedGraphic.geometry.y = deltaY
    //clonedGraphic.geometry.x += 2;
    clonedGraphic.geometry.x = Math.floor(Math.random()*360) - 180
    clonedGraphic.geometry.y = Math.round(Math.acos(2*Math.random() - 1)*180/Math.PI) - 90
    clonedGraphic.attributes.new = `[${clonedGraphic.geometry.x},${clonedGraphic.geometry.y}]`
    clonedGraphic.attributes.UPDATE_TIME = new Date()
    return clonedGraphic
  }

  private setNewCoordsBetter(gr) {
    gr.geometry.x = gr.geometry.x + 2
    return gr;
  }

  private createGraphicsData(i) {
    return {
      geometry: /*webMercatorUtils.geographicToWebMercator(*/{
        // Los Angeles
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        type: "point",
        spatialReference: {
          wkid: 4326
        }
      }/*)*/,
      attributes: {
        NAME: "Feature #" + i,
        ANGLE: Math.round(Math.random() * 360),
        UPDATE_TIME: new Date()
      }
    }
  }



  initDeckLayers() {
    loadArcGISModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/geometry/support/webMercatorUtils',
      'esri/Graphic'
    ]).then(({ DeckLayer, modules }) => {
      const [ArcGISMap, MapView, webMercatorUtils, Graphic] = modules;
      this.layer = new DeckLayer();
      //const layer = this.layer
      this.layer.deck.layers = [];

      this.graphics = [];
      let count = 10000;
      let _distance = 10000;
      for (let i = 0; this.graphics.length < count; i++) {
        this.graphics.push(new Graphic(this.createGraphicsData(i)));
      }
      console.log(this.graphics);


      this.allLayers.push(new TextLayer({
        data: [{ name: 'DORDORDOR', coord: [34, 32] }],
        pickable: true,
        getPosition: d => d.coord,
        getText: d => d.name,
        getColor: [255, 255, 255, 255],
        getSize: 50,
        getAngle: 0,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        fontFamily: 'Heebo'
      }))

      const ICON_MAPPING = {
        marker: { x: 0, y: 0, width: 512, height: 512, mask: true }
      };
      this.allLayers.push(new IconLayer({
        id: 'icon-layer',
        data: this.graphics,
        pickable: true,
        iconAtlas: 'https://image.flaticon.com/icons/svg/3075/3075933.svg',
        iconMapping: ICON_MAPPING,
        scaleSize: 15,
        getIcon: d => 'marker',
        getPosition: d => [d.geometry.x, d.geometry.y],
        getSize: d => 150,
        getColor: (d) => [Math.sqrt(d.exits), 140, 0],
      }))

      new MapView({
        container: "viewDiv",
        map: new ArcGISMap({
          basemap: "dark-gray-vector",
          layers: [this.layer]
        }),
        center: [34, 32],
        zoom: 6
      });
    });
  }
}