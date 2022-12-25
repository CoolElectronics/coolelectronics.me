<script lang="ts">
  import TopBar from "../components/TopBar.svelte";
  import request from "../requests";

  import jq from "jquery";
  import * as Ftp from "../../routes/ftp/types";
  import { Failure } from "../../clienttypes";

  const defaultFileReq: Ftp.CreateFileRequest = {
    url: "",
    name: "",
    visibility: Ftp.FileVisibility.PRIVATE,
    type: Ftp.FileType.RAW,
    description: "",
  };

  let visible = false;

  let fileReq = { ...defaultFileReq };

  async function createFile() {
    let file: Ftp.ClientFile | Failure = await request<Ftp.CreateFileRequest>(
      Ftp.CreateFile,
      fileReq
    );
    if ("failure" in file) {
      alert(file.failure);
      return;
    }

    fileReq = { ...defaultFileReq };

    updateContents(file.uuid);
  }

  async function updateContents(uuid: string) {
    let elm: HTMLFormElement = jq("<input type='file'>")[0] as HTMLFormElement;
    elm.click();
    elm.onchange = (e) => {
      let file = (<any>e.target).files[0];
      var formData = new FormData();
      formData.append("file", file);
      formData.append("uuid", uuid);
      jq.ajax({
        url: "/api/ftp/upload",
        type: "POST",
        data: formData,
        processData: false, // tell jQuery not to process the data
        contentType: false, // tell jQuery not to set contentType
        success: function (data) {
          console.log(data);
          alert(data.message);
        },
      });
      elm.remove();
    };
  }
</script>

<main class="dark">
  <TopBar title="File Hosting" />

  <div class="darkm1">
    <input bind:value={fileReq.url} />
    <input bind:value={fileReq.name} />
    <input bind:value={fileReq.description} />

    <input type="checkbox" bind:value={visible} />
    <!-- <input -->

    <button on:click={createFile}>create</button>
  </div>
</main>

<style>
</style>
