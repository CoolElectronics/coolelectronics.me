<script lang="ts">
  import TopBar from "../components/TopBar.svelte";
  import Switch from "../components/Switch.svelte";
  import request from "../requests";

  import jq from "jquery";
  import * as Ftp from "../../routes/ftp/types";
  import { Failure } from "../../clienttypes";
  import { onMount } from "svelte";

  const defaultFileReq: Ftp.CreateFileRequest = {
    url: "",
    name: "",
    visibility: Ftp.FileVisibility.PRIVATE,
    type: Ftp.FileType.RAW,
    description: "",
  };

  let visible = false;

  let fileReq = { ...defaultFileReq };

  let files: Ftp.ClientFile[];

  let selectedfile: string = "new";

  onMount(async () => {
    files = await request(Ftp.GetFiles);
  });
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
  async function updateFileSettings() {
    if (selectedfile == "new") return;

    request<Ftp.EditFileRequest>(Ftp.EditFile, {
      ...fileReq,
      uuid: selectedfile,
    });
  }

  async function selectFile(file: Ftp.ClientFile) {
    fileReq = { ...file };
    selectedfile = file.uuid;
  }

  async function reuploadFile() {
    if (selectedfile == "new") return;
    updateContents(selectedfile);
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
        },
        xhr: function () {
          var xhr = new window.XMLHttpRequest();

          xhr.upload.addEventListener(
            "progress",
            function (evt) {
              if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                percentComplete = percentComplete * 100;
                console.log(percentComplete);
              }
            },
            false
          );

          return xhr;
        },
      });
      elm.remove();
    };
  }
</script>

<main class="dark flex flex-col">
  <TopBar title="File Hosting" />
  <div class="flex flex-1">
    <div class="darkm1 flex p-2 flex-col overflow-y-scroll">
      <button on:click={() => (selectedfile = "new")} class="darkm2 m-2">
        <p class="text text-md">Add file</p>
      </button>
      {#if files != null}
        {#each files as file}
          <button on:click={() => selectFile(file)} class="darkm2 m-2">
            <p class="text text-md">{file.name}</p>
          </button>
        {/each}
      {/if}
    </div>
    <div class="dark flex-1 flex justify-center items-center">
      <div class="darkm1 p-4">
        <p class="text">URL:</p>
        <input bind:value={fileReq.url} />
        <p class="text">Title:</p>
        <input bind:value={fileReq.name} />
        <p class="text">Description:</p>
        <input bind:value={fileReq.description} />
        <p class="text">Visibility:</p>
        <Switch
          options={[Ftp.FileVisibility.PRIVATE, Ftp.FileVisibility.PUBLIC]}
          names={["private", "public"]}
          bind:selected={fileReq.visibility}
        />
        <p class="text">File Type:</p>
        <Switch
          options={[Ftp.FileType.IMAGE, Ftp.FileType.VIDEO, Ftp.FileType.RAW]}
          names={["image", "video", "raw"]}
          bind:selected={fileReq.type}
        />
        <br />
        {#if selectedfile == "new"}
          <button class="darkp1 text text-md" on:click={createFile}
            >create</button
          >
        {:else}
          <button class="darkp1 text text-md" on:click={updateFileSettings}
            >Update Settings</button
          >
          <button class="darkp1 text text-md" on:click={reuploadFile}
            >Reupload File</button
          >
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  input {
    outline: none;
    background-color: var(--darkm2);
    color: var(--text);
  }
</style>
