<script lang="ts">
  import TopBar from "../components/TopBar.svelte";
  import Separator from "./Separator.svelte";
  import * as Sparkboard from "../../routes/sparkboard/types";

  import * as PIXI from "pixi.js";
  import { Viewport } from "pixi-viewport";
  import {
    Circle,
    Container,
    DisplayObject,
    Graphics,
    InteractionData,
    SCALE_MODES,
    Sprite,
  } from "pixi.js";
  import { onMount } from "svelte/internal";

  import { FontAwesomeIcon } from "fontawesome-svelte";
  import {
    faEdit,
    faFloppyDisk,
    faPlus,
    faTrash,
  } from "@fortawesome/free-solid-svg-icons";
  import request from "../requests";
  import { Board, SerializedNode } from "../../clienttypes";

  import BoardCard from "./BoardCard.svelte";

  const COLORS = {
    WHITE: 0xf9f5d7,
    WHITE1: 0xebdbb2,
    WHITE2: 0xd5c4a1,
    WHITE3: 0xa89984,
    BLACK: 0x282828,
    BLACK1: 0x3c3836,
    BLACK2: 0x504945,
    BLACK3: 0x7c6f64,
  };

  let htmlparent: HTMLElement;
  //
  let boardtitle = "Untitled Board";

  var rootnodes: Node[] = [];
  var nodes: Node[] = [];
  var selectednode: Node | null = null;
  var viewport: Viewport;

  var selectedboard: string | null = null;

  var allboards: Sparkboard.BoardsResponse;

  onMount(async () => (allboards = await request(Sparkboard.Boards)));

  async function newBoard() {
    allboards = [...allboards, await request(Sparkboard.NewBoard)];
  }
  async function deleteBoard(uuid: string) {
    allboards = allboards.filter((b) => b.uuid != uuid);
    request<Sparkboard.DeleteBoardRequest>(Sparkboard.DeleteBoard, {
      uuid,
    });
  }
  async function save() {
    if (selectedboard) {
      let req: Sparkboard.SaveBoardRequest = {
        uuid: selectedboard,
        title: boardtitle,
        nodes: rootnodes.map(serializeNode),
      };
      request<Sparkboard.SaveBoardRequest>(Sparkboard.SaveBoard, req);
    }
  }
  setInterval(save, 15000);

  onbeforeunload = async (event) => {
    await save();
  };
  async function selectBoard(uuid: string) {
    selectedboard = uuid;
    let board = await request<
      Sparkboard.GetBoardRequest,
      Sparkboard.GetBoardResponse
    >(Sparkboard.GetBoard, { uuid });
    boardtitle = board.title;

    const app = new PIXI.Application({
      resizeTo: htmlparent as HTMLElement,
      backgroundColor: 0x1d2021,
    });
    htmlparent.appendChild(app.view);

    // create viewport
    const ratio = 16 / 9;
    console.log(ratio);
    viewport = new Viewport({
      screenWidth: app.view.width,
      screenHeight: app.view.height,
      worldWidth: 4000 * ratio,
      worldHeight: 4000 / ratio,

      interaction: app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    });

    app.stage.addChild(viewport);

    viewport.drag().pinch().wheel().decelerate();
    viewport.clamp({
      direction: "all",
    });
    viewport.clampZoom({
      minScale: 0.4,
      maxScale: 20,
    });

    viewport.on("pointerdown", () => {
      selectednode = null;
    });

    const graphics = new Graphics();

    viewport.addChild(graphics);

    let lastscaled;

    app.ticker.add((dt) => {
      viewport.screenWidth = app.view.width;
      viewport.screenHeight = app.view.height;
      // let interval = 80;
      // // let scale = 25;
      // // let snap = 1000;
      // // let interval = viewport.getVisibleBounds().width / scale;
      // // interval = Math.floor(interval / snap) * snap
      // // interval = Math.max(viewport.getVisibleBounds().width / scale, interval);
      // if (viewport.scaled > 0.7) {
      //   interval = 80;
      // }
      // if (viewport.scaled > 1) {
      //   interval = 40;
      // }
      // if (viewport.scaled > 1.3) {
      //   interval = 20;
      // }
      // if (viewport.scaled > 1.6) {
      //   interval = 10;
      // }
      // if (viewport.scaled > 2) {
      //   interval = 5;
      // }
      // let vwidth = viewport.worldWidth;
      // let vheight = viewport.worldHeight;
      // if (viewport.getVisibleBounds() != lastscaled) {
      //   graphics.clear();
      //
      //   graphics.lineStyle({
      //     width: interval / 40,
      //     color: COLORS.WHITE3,
      //   });
      //   let rect = new PIXI.Rectangle(
      //     viewport.getVisibleBounds().x - interval,
      //     viewport.getVisibleBounds().y - interval,
      //     viewport.getVisibleBounds().width + interval,
      //     viewport.getVisibleBounds().height + interval
      //   );
      //   for (let x = 0; x < vwidth; x += interval) {
      //     for (let y = 0; y < vheight; y += interval) {
      //       if (rect.contains(x, y)) {
      //         graphics.drawRect(x, y, interval, interval);
      //       }
      //     }
      //   }
      //   lastscaled = viewport.getVisibleBounds();
      // }
      nodes.forEach((n) => {
        n.render();
      });
    });
    for (let n of board.nodes) {
      deserializeNode(n, null);
    }
  }
  function selectnode(node: Node) {
    selectednode = node;
    //
    // let properties = $("#properties");
    // $("#properties-name").innerText = node.name;
    // $<HTMLTextAreaElement>("#properties-description").value = node.description;
    // properties.style.display = "block";
  }

  class Node {
    position: Vec2;
    root: Container;
    children: Node[] = [];
    parent: Node | null;
    name = "node";
    graphics = new Graphics();
    text: PIXI.Text;
    dragging = false;
    description = "";
    oldname = "";
    constructor(parent: Node | null) {
      this.parent = parent;

      this.position = { x: 0, y: 0 };
      this.root = new Container();
      if (parent != null) {
        this.root.scale = {
          x: parent.root.scale.x / 1.2,
          y: parent.root.scale.y / 1.2,
        };
      }

      let outer = new Graphics();
      outer.beginFill(COLORS.WHITE);
      outer.drawCircle(40, 40, 50);
      outer.endFill();
      outer.interactive = true;

      let inner = new Graphics();
      inner.beginFill(0xfb4934);
      inner.drawCircle(40, 40, 40);
      inner.endFill();
      inner.interactive = true;

      // inner

      let data: InteractionData | null = null;
      const outerdragend = () => {
        viewport.interactive = true;
        if (data == null) return;
        let n = new Node(this);
        selectnode(n);
        let pos = data.getLocalPosition(this.root);
        n.position.x = pos.x;
        n.position.y = pos.y;

        this.children.push(n);
      };
      outer.on("pointerdown", (e) => {
        viewport.interactive = false;
        data = e.data;
      });
      outer.on("pointerup", outerdragend);
      outer.on("pointerupoutside", outerdragend);

      const innerdragend = () => {
        viewport.interactive = true;
        this.dragging = false;

        let pos = data!.getLocalPosition(this.root);
        let nx = pos.x * this.root.scale.x - 40 * this.root.scale.x;
        let ny = pos.y * this.root.scale.x - 40 * this.root.scale.x;
        console.log(nx);
        if (Math.abs(nx) > 100 || Math.abs(ny) > 100) {
          this.position.x += nx;
          this.position.y += ny;
        }
        selectnode(this);
      };
      inner.on("pointerdown", (e) => {
        viewport.interactive = false;
        data = e.data;
        this.dragging = true;
      });
      // inner.on("pointermove", () => {
      //     if (this.dragging) {
      //         let pos = data!.getLocalPosition(this.root, this.position, startdragpos);
      //         // this.position.x = pos.x;
      //         // this.position.y = pos.y;
      //     }
      // })
      inner.on("pointerup", innerdragend);
      inner.on("pointerupoutside", innerdragend);

      this.text = new PIXI.Text(
        this.name,
        new PIXI.TextStyle({
          wordWrap: true,
          breakWords: true,
          wordWrapWidth: 60,
          lineHeight: 20,
          fontSize: 25,
          align: "center",
        })
      );
      this.text.updateText(false);
      this.text.resolution = 5;
      this.text.x = 10;
      this.text.y = 10;
      this.root.addChild(this.graphics);
      this.root.addChild(outer);

      this.root.addChild(inner);
      this.root.addChild(this.text);
      viewport.addChild(this.root);

      parent?.root.addChild(this.root);
      // enable this if you want idk

      nodes.push(this);
    }
    render() {
      this.root.x = this.position.x;
      this.root.y = this.position.y;
      this.text.text = this.name;

      if (this.name != this.oldname) {
        this.text.style.fontSize = 25;
        while (
          this.text.getLocalBounds().height > 60 &&
          (this.text.style.fontSize as number) > 2
        ) {
          this.text.style.fontSize = (this.text.style.fontSize as number) - 1;
        }
        this.oldname = this.name;
      }
      this.graphics.clear();

      this.graphics.lineStyle({
        color: COLORS.WHITE1,
        width: 10,
      });
      this.children.forEach((n) => {
        let noffset = 40 * n.root.scale.x;
        let toffset = 40 * this.root.scale.x;
        this.graphics.moveTo(n.position.x + noffset, n.position.y + noffset);
        this.graphics.lineTo(toffset, toffset);
      });
    }

    remove() {
      let filterer = (r) => r != this;
      rootnodes = rootnodes.filter(filterer);
      nodes = nodes.filter(filterer);
      if (this.parent) {
        this.parent.children = this.parent.children.filter(filterer);
      }

      this.root.destroy();

      selectednode = null;
    }
  }

  class Vec2 {
    x: number;
    y: number;
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
  }
  function addNode() {
    let node = new Node(null);
    // viewport.to
    // let v = { x: app.view.width / viewport.scaled, y: app.view.height / viewport.scaled }
    let bounds = viewport.getVisibleBounds();
    node.position.x = bounds.x + bounds.width / 2;
    node.position.y = bounds.y + bounds.height / 2;
    rootnodes.push(node);
    selectnode(node);
  }

  function serializeNode(n: Node): any {
    return {
      name: n.name,
      pos: n.position,
      description: n.description,
      children: n.children.map(serializeNode),
    };
  }
  function deserializeNode(nodedat: SerializedNode, parent: Node | null): Node {
    console.log(nodedat);
    let node = new Node(parent);
    node.position = nodedat.pos;
    node.description = nodedat.description;
    node.name = nodedat.name;
    nodedat.children.forEach((child) => {
      node.children.push(deserializeNode(child, node));
    });

    nodes.push(node);
    if (!parent) {
      rootnodes.push(node);
    }
    return node;
  }
</script>

<main class="dark flex flex-col">
  <TopBar title="SparkBoard" />
  {#if selectedboard != null}
    <div class="darkm2 flex justify-evenly p-1">
      <div>
        <div class="flex">
          <p contenteditable class="text text-xl" bind:innerHTML={boardtitle} />
        </div>
      </div>
      <div class="flex">
        <button on:click={addNode}>
          <FontAwesomeIcon icon={faPlus} size="2x" inverse={true} />
        </button>
        <button on:click={save}>
          <FontAwesomeIcon icon={faFloppyDisk} size="2x" inverse={true} />
        </button>
      </div>
    </div>
    <div class="flex flex-1 relative">
      <div class="flex-1" bind:this={htmlparent} />
      {#if selectednode != null}
        <div class="flex-1 darkm2 p-5" id="panel">
          <div class="flex items-center justify-center">
            <input class="dark text text-xl" bind:value={selectednode.name} />
          </div>
          <Separator />
          <div
            class="text text-xl"
            contenteditable
            bind:innerHTML={selectednode.description}
          />
          <Separator />
          <button on:click={() => selectednode?.remove()}>
            <FontAwesomeIcon icon={faTrash} size="2x" inverse={true} />
          </button>
        </div>
      {/if}
    </div>
  {:else if allboards}
    {#each allboards as board}
      <BoardCard
        title={board.title}
        del={() => deleteBoard(board.uuid)}
        click={() => selectBoard(board.uuid)}
      />
    {/each}
    <button on:click={newBoard}>New</button>
  {/if}
</main>

<style>
  #panel {
    position: absolute;
    right: 0;
    height: 100%;
  }
</style>
