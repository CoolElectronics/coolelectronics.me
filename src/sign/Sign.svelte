<script lang="ts">
  import jquery from "jquery";
  import request from "../requests";
  import * as Account from "../../routes/account/types";
  import * as Sign from "../../routes/sign/types";

  let signUp = false;
  let username: string;
  let password: string = "";

  let confirmpassword: string = "";

  let error: string | null = null;

  async function submit() {
    if (signUp) {
      if (password == confirmpassword && password != "") {
        let res = await Promise.resolve(
          jquery.post("/api/sign/up", {
            username,
            password,
          })
        );
        if (!res.success) {
          error = res.reason;
        } else {
          error = null;
        }
      } else {
        error = "password and confirm password do not match";
      }
    } else {
      let res = await Promise.resolve(
        jquery.post("/api/sign/in", {
          username,
          password,
        })
      );
      if (!res.success) {
        error = res.reason;
      } else {
        error = null;
      }
    }
    if (!error) {
      window.location.replace("/home");
    }
  }
  async function forgotPassword() {
    let res = await request<
      Sign.ResetPasswordRequest,
      Sign.ResetPasswordResponse
    >(Sign.ResetPassword, {
      username: prompt("enter username")!,
      password: prompt("enter new password")!,
    });
    if (res) {
      alert(
        "Requested a password reset. DM CoolElectronics#4683 to approve your request"
      );
    } else {
      alert("User doesn't exist!");
    }
  }
</script>

<main class="dark">
  <!-- <div class = "appcontainer"> /</div> -->
  <div class="darkm1 shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
    <div class="mb-4">
      <label class="block text text-sm font-bold mb-2" for="username">
        Username
      </label>
      <input
        class="darkm2 shadow appearance-none text rounded w-full py-2 px-3"
        bind:value={username}
        type="text"
        placeholder="Username"
      />
    </div>
    <div class="mb-1">
      <label class="block text text-sm font-bold mb-2" for="password">
        Password
      </label>
      <input
        class="darkm2 shadow appearance-none text {password == ''
          ? 'border border-red-500'
          : ''} rounded w-full py-2 px-3 text-grey-500 mb-3"
        bind:value={password}
        type="password"
        placeholder="******************"
      />
      <!-- <p class="text-red text-xs italic">Please choose a password.</p> -->
    </div>
    {#if signUp}
      <div class="mb-1">
        <label
          class="block text-gray-500 text-sm font-bold mb-2"
          for="confirm-password"
        >
          Confirm Password
        </label>
        <input
          class="darkm2 shadow appearance-none text {confirmpassword == ''
            ? 'border border-red-500'
            : ''} rounded w-full py-2 px-3 text-grey-500 mb-3"
          bind:value={confirmpassword}
          type="password"
          placeholder="******************"
        />
      </div>
    {/if}
    {#if error != null}
      <div
        class="pb-1 mb-4 shadow border border-red-500 rounded flex justify-center text-center items-center"
      >
        <p
          class="m-2 text-center flex justify-center items-center text-red-500 text-xs italic"
        >
          {error}
        </p>
      </div>
    {/if}
    <div class="flex items-center justify-between">
      <button
        class="darkp2 hover:bg-blue-dark text-white font-bold py-2 px-4 rounded"
        on:click={submit}>{signUp ? "Sign Up" : "Sign In"}</button
      >
      <div>
        <p
          class="text hover:text-blue-400 underline"
          on:click={() => (signUp = !signUp)}
        >
          {!signUp ? "create account" : "use existing account"}
        </p>
        <p class="text hover:text-blue-500 underline" on:click={forgotPassword}>
          forgot password
        </p>
      </div>
    </div>
  </div>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
