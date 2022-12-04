<script lang="ts">
  import request from "../requests";

  import * as Frc from "../../routes/frc/types";
  import TopBar from "../components/TopBar.svelte";
  import SelectButton from "../components/SelectButton.svelte";
  import CargoIncrementor from "./CargoIncrementor.svelte";
  import {
    faRightFromBracket,
    faHouseUser,
    faSignOut,
    faSignIn,
  } from "@fortawesome/free-solid-svg-icons";
  import {
    FontAwesomeIcon,
    FontAwesomeLayers,
    FontAwesomeLayersText,
  } from "fontawesome-svelte";

  import Switch from "../components/Switch.svelte";

  let allrobots: Frc.ClientRobot[] = [];

  let matchnum = 1;
  let robot: Frc.Robot = newRobot();

  let thin = false;
  let traversalNames = ["None", "Low", "Middle", "High", "Traversal"];
  window.onresize = () => (thin = window.innerWidth < 900);

  (async () => {
    allrobots = await request(Frc.GetRobots);
  })();

  function deleteRobot(uuid: string | undefined) {
    request<Frc.DeleteRobotRequest>(Frc.DeleteRobot, {
      uuid: uuid!,
    });
  }
  async function submitRobot() {
    robot.team = parseInt(robot.team as unknown as string);
    robot.match = parseInt(robot.match as unknown as string);
    await request<Frc.AddRobotRequest>(Frc.AddRobot, robot);
    matchnum++;
    robot = newRobot();
  }

  function newRobot(): Frc.Robot {
    return {
      team: 1234,
      match: matchnum,
      taxi: false,
      note: "comments....",
      auto: {
        lower: {
          missed: 0,
          scored: 0,
        },
        upper: {
          missed: 0,
          scored: 0,
        },
      },
      teleop: {
        lower: {
          missed: 0,
          scored: 0,
        },
        upper: {
          missed: 0,
          scored: 0,
        },
      },
      endgame: Frc.EndgameScore.NONE,
    };
  }
  function clearRobot() {
    robot = newRobot();
  }
</script>

<main class="dark">
  <div class="darkm1 rounded-md p-2">
    <div
      class={`text flex items-center ${
        thin ? "justify-evenly" : "justify-center"
      } p-1 ${thin ? "flex-col" : ""}`}
    >
      <div class="p-1 darkm1 rounded-sm flex">
        <p class="text">team:</p>
        <input bind:value={robot.team} />
      </div>
      <div class="p-1 darkm1 rounded-sm flex">
        <p class="text">match #:</p>
        <input bind:value={robot.match} />
      </div>
    </div>
    <div class={"justify-evenly flex " + (thin ? "flex-col" : "")}>
      <CargoIncrementor title="Autonomous" bind:score={robot.auto} />
      <CargoIncrementor title="Teleoperated" bind:score={robot.teleop} />
    </div>

    <div
      class={`text flex items-center ${
        thin ? "justify-evenly" : "justify-center"
      } p-1 ${thin ? "flex-col" : ""}`}
    >
      <div class="p-1 items-center darkm1 rounded-sm flex">
        <p class="text">taxi?:</p>
        <Switch
          options={[false, true]}
          names={["No", "Yes"]}
          bind:selected={robot.taxi}
        />
      </div>
      <div class="p-1 items-center darkm1 rounded-sm flex">
        <p class="text">Endgame:</p>
        <Switch
          options={[
            Frc.EndgameScore.NONE,
            Frc.EndgameScore.LOW,
            Frc.EndgameScore.MIDDLE,
            Frc.EndgameScore.HIGH,
            Frc.EndgameScore.TRAVERSAL,
          ]}
          names={traversalNames}
          bind:selected={robot.endgame}
        />
      </div>
    </div>
    <!-- endgame selector -->

    <div
      class="darkp1 rounded-md text"
      contenteditable
      bind:textContent={robot.note}
    />
    <!-- no idea why it errors here! it should work fine  -->
    <div class="justify-evenly flex">
      <SelectButton click={clearRobot} text="Clear" />
      <SelectButton click={submitRobot} text="Submit" />
    </div>
  </div>
  <!-- <TopBar title="Scouting Helper" askForNotifs={false} /> -->
  {#each allrobots as robot}
    <div class="darkp2 rounded-md flex flex-col justify-center items-center">
      <div class="text-center text text-lg">
        Team: {robot.robot.team} | Match #:{robot.robot.match}
      </div>
      <div class="flex m-0.5">
        {#each ["Autonomous", "Teleoperated"] as cargotype, cdi}
          {@const cargoscore = cdi == 0 ? robot.robot.auto : robot.robot.teleop}
          <div class="darkp1 m-2">
            <p class="text text-center text-lg">{cargotype}</p>
            <div class="flex m-1">
              {#each ["Upper", "Lower"] as scorekind, sdi}
                {@const score = sdi == 0 ? cargoscore.upper : cargoscore.lower}
                <div class="flex flex-col">
                  <p class="text text-center text-md">
                    {scorekind}
                  </p>
                  <div class="darkm1 rounded-md m-2">
                    <!-- <p class="text text-center text-md">
                      total: {score.missed + score.scored}
                    </p> -->
                    <p class="text text-center text-sm">
                      scored: {score.scored}<br />
                      <!-- missed: {score.missed}<br /> -->
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
      <p class="text text-md">
        taxi: {robot.robot.taxi ? "Yes" : "No"}<br />
        endgame: {traversalNames[robot.robot.endgame]}<br />
        notes: {robot.robot.note}
      </p>
      <SelectButton click={() => deleteRobot(robot.robot.uuid)} text="delete" />
    </div>
  {/each}
</main>

<style>
  #footer {
    position: absolute;
    bottom: 0;
    left: 10%;
  }
  input {
    /* width:100%; */
    min-width: 0;
    background-color: var(--darkm2);
    outline: none;
    text-align: center;
    border-radius: 5px;
  }
</style>
