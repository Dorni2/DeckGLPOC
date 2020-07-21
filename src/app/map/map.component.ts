import { Component, OnInit } from '@angular/core';
//import { loadArcGISModules } from "@deck.gl/arcgis";
//import { BitmapLayer, TextLayer, IconLayer } from '@deck.gl/layers';
declare var deck: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})


export class MapComponent implements OnInit {
  ron;
  layer;
  allLayers = [];
  graphics = [];
  iconLayerData = []
  total = 0
  i = 0
  previousTime;

  constructor() {
    this.initDeckLayers();
  }

  ngOnInit(): void {
  }

  setlayer() {
    this.layer.deck.layers = [this.ron];
    this.previousTime = performance.now();
    requestAnimationFrame(this.updatelayer.bind(this));

    // setInterval(() => {
    //   this.updatelayer()
    // }, 1);
  }


  updatelayer() {
    let t = performance.now();
    this.total += t - this.previousTime;
    console.log(this.total / ++this.i);
    this.previousTime = t;
    //let iconLayer = this.layer.deck.layers.find(l => l.id.includes('icon-layer'));
    let data = this.ron.props.data;
    let newData = [];
    newData = data.map(oldGraphic => this.setNewCoord(oldGraphic));

    this.ron.props.data = newData;

    //this.iconLayerData = [...newData];
    //this.ron.props.data = [...newData];
    this.layer.deck.layers = [this.ron];

    const ICON_MAPPING = {
      mask1: { x: 0, y: 0, width: 512, height: 512, mask: false },
      mask2: { x: 512, y: 0, width: 512, height: 512, mask: false },
      mask3: { x: 1024, y: 0, width: 512, height: 512, mask: false }
    };

    this.layer.deck.layers = this.layer.deck.layers.filter(l => l !== this.ron)

    this.ron = new deck.IconLayer({
      id: `icon-layer${Math.random() * 10}`,
      // data: [{ name: 'Colma (COLM)', address: '365 D Street, Colma CA 94014', exits: 4214, coordinates: [34.5, 32] },
      // { name: 'Colma (COLM)', address: '365 D Street, Colma CA 94014', exits: 4214, coordinates: [35, 32] }],
      data: newData,
      pickable: true,
      iconAtlas: 'https://i.imgur.com/F0J3MSX.png',
      iconMapping: ICON_MAPPING,
      scaleSize: 15,
      getIcon: d => d.attributes.IMAGE_NAME,
      // getIcon: d => ({
      //   url: d.attributes.IMAGE_URL,
      //   width: 128,
      //   height: 128,
      //   anchorY: 128
      // }),
      getPosition: d => [d.geometry.x, d.geometry.y],
      getSize: d => 50,
      //getColor: (d) => [Math.random() * 255, Math.random() * 255, Math.random() * 255],
    })

    this.layer.deck.layers.push(this.ron);

    requestAnimationFrame(this.updatelayer.bind(this))
  }

  private setNewCoord(gr) {
    // let clonedGraphic = gr.clone();
    // clonedGraphic.attributes.old = `[${clonedGraphic.geometry.x},${clonedGraphic.geometry.y}]`
    // let _distance = 10000
    // var radians = clonedGraphic.attributes.ANGLE * (Math.PI / 180); // Convert angle to radians
    // var newX = clonedGraphic.geometry.x + _distance * Math.cos(radians); // calc new X
    // var newY = clonedGraphic.geometry.y + _distance * Math.sin(radians); // calc new Y
    // var deltaX = newX - clonedGraphic.geometry.x;
    // var deltaY = newY - clonedGraphic.geometry.y;
    // // clonedGraphic.geometry.x = deltaX
    // // clonedGraphic.geometry.y = deltaY
    // //clonedGraphic.geometry.x += 2;
    // //clonedGraphic.geometry.x = Math.floor(Math.random()*360) - 180
    // //clonedGraphic.geometry.y = Math.round(Math.acos(2*Math.random() - 1)*180/Math.PI) - 90
    // clonedGraphic.geometry.x += (Math.random() - 0.5) / 8
    // clonedGraphic.geometry.y += (Math.random() - 0.5) / 8
    // clonedGraphic.attributes.new = `[${clonedGraphic.geometry.x},${clonedGraphic.geometry.y}]`
    // clonedGraphic.attributes.UPDATE_TIME = new Date();
    // return clonedGraphic
    gr.geometry.x += (Math.random() - 0.5) / 8
    gr.geometry.y += (Math.random() - 0.5) / 8
    return gr;
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
        UPDATE_TIME: new Date(),
        IMAGE_NAME: i % 3 == 0 ? 'mask1' : i % 3 == 1 ? 'mask2' : 'mask3',
        IMAGE_URL: i % 3 == 0 ? 'https://image.flaticon.com/icons/svg/3165/3165233.svg' :
          i % 3 == 1 ? 'https://image.flaticon.com/icons/svg/3165/3165197.svg' : 'https://image.flaticon.com/icons/svg/3165/3165214.svg'
      }
    }
  }



  initDeckLayers() {
    deck.loadArcGISModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/geometry/support/webMercatorUtils',
      'esri/Graphic',
      'esri/layers/VectorTileLayer'
    ]).then(({ DeckLayer, modules }) => {
      const [ArcGISMap, MapView, webMercatorUtils, Graphic, VectorTileLayer] = modules;
      this.layer = new DeckLayer();
      // @ts-ignore
      //let deckFramework = deck;
      deck.log.enable(true);
      deck.log.level = 2
      this.layer.deck.layers = [];

      this.graphics = [];
      let count = 10000;
      let _distance = 10000;
      for (let i = 0; this.graphics.length < count; i++) {
        this.graphics.push(new Graphic(this.createGraphicsData(i)));
      }
      this.iconLayerData = this.graphics;


      // this.allLayers.push(new deck.TextLayer({
      //   data: [{ name: 'DORDORDOR', coord: [34, 32] }],
      //   pickable: true,
      //   getPosition: d => d.coord,
      //   getText: d => d.name,
      //   getColor: [255, 255, 255, 255],
      //   getSize: 50,
      //   getAngle: 0,
      //   getTextAnchor: 'middle',
      //   getAlignmentBaseline: 'center',
      //   fontFamily: 'Heebo'
      // }))

      const ICON_MAPPING = {
        mask1: { x: 0, y: 0, width: 512, height: 512, mask: false },
        mask2: { x: 512, y: 0, width: 512, height: 512, mask: false },
        mask3: { x: 1024, y: 0, width: 512, height: 512, mask: false }
      };
      this.ron = new deck.IconLayer({
        id: 'icon-layer',
        data: this.graphics,
        pickable: true,
        iconAtlas: 'https://i.imgur.com/F0J3MSX.png',
        iconMapping: ICON_MAPPING,
        scaleSize: 15,
        getIcon: d => d.attributes.IMAGE_NAME,
        // getIcon: d => ({
        //   url: d.attributes.IMAGE_URL,
        //   width: 128,
        //   height: 128,
        //   anchorY: 128
        // }),
        getPosition: d => [d.geometry.x, d.geometry.y],
        getSize: d => 50,
        getColor: (d) => [Math.sqrt(d.exits), 140, 0],
        // updateTriggers: {
        //   getPosition: [this.iconLayerData]
        // },
        // dataComparator: (newData, oldData) => {
        //   if (newData[0].attributes.UPDATE_TIME > oldData[0].attributes.UPDATE_TIME) {
        //     return false
        //   }
        //   return true;
        // }
      });
      //this.allLayers.push(this.ron);

      let x = new MapView({
        container: "viewDiv",
        map: new ArcGISMap({
          layers: [new VectorTileLayer({url:'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer'}), 
                   this.layer]
        }),
        center: [34, 32],
        zoom: 6
      });

      console.error(x);
    });
  }
}