<script lang="ts">
  import request from "../requests";

    import * as Frc from "../../routes/frc/types";
  import TopBar from "../components/TopBar.svelte";
  import SelectButton from "../components/SelectButton.svelte";

  let allrobots:Frc.ClientRobot[] = [];

  let matchnum = 0;
  let robot:Frc.Robot;

  (async ()=>{
    allrobots = await request(Frc.GetRobots);
  })();

  function deleteRobot(uuid:string | undefined){
    request<Frc.DeleteRobotRequest>(Frc.DeleteRobot,{
      uuid: uuid!,
    })
  }
  async function submitRobot(){
    await request<Frc.AddRobotRequest>(Frc.AddRobot,robot);
    matchnum ++;
    robot = newRobot();
  }

  function newRobot(): Frc.Robot{
    return {

    }
  }
  function clearRobot(){
    robot = newRobot();
  }
</script>
<main class = "dark">
  <div class = "dark1">


    <SelectButton click = {submitRobot} text = "submit"></SelectButton>
  </div>
  <!-- <TopBar title="Scouting Helper" askForNotifs={false} /> -->
  {#each allrobots as robot}
    Scout: {robot.scout.name} Team: {robot.robot.team}
    {JSON.stringify(robot.robot)}
    <SelectButton click = {()=>deleteRobot(robot.robot.uuid)} text = "delete"></SelectButton>
  {/each}
</main>

<style>
#footer{
  position: absolute;
  bottom: 0;
  left:10%;
}
</style>
