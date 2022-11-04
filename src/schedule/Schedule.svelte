
<script lang="ts">
  import Background from "../components/Background.svelte";
  import TopBar from "../components/TopBar.svelte";

  let classes = [
    [8 * 60 + 30, 8 * 60 + 40],
    [8 * 60 + 40, 9 * 60 + 21],
    [9 * 60 + 26, 10 * 60 + 7],
    [10 * 60 + 12, 10 * 60 + 53],
    [10 * 60 + 58, 11 * 60 + 39],
    [11 * 60 + 44, 12 * 60 + 25],
    [12 * 60 + 30, 13 * 60 + 11],
    [13 * 60 + 16, 13 * 60 + 57],
    [14 * 60 + 2, 14 * 60 + 43],
    [14 * 60 + 48, 15 * 60 + 30],
  ];
  /// bad code

  let timestring: string;
  let timeleft;
  
  let fulltimeleft;
  let currentPeriod: number | [number] | undefined;

  setInterval(update, 1000);
  update();

  function update() {
    let date = new Date();
    let minutes = date.getHours() * 60 + date.getMinutes();

    timestring = formatDate(minutes);
    let period = getPeriod(minutes);

    if (period != undefined){
      if (period[0]){
        timeleft = (classes[period[0]][0] - minutes)-1 + " Minutes, " + (60 - date.getSeconds()) + " seconds";
      }else if (typeof period == "number"){
        timeleft = (classes[period][1] - minutes)-1 + " Minutes, " + (60 - date.getSeconds()) + " seconds";
      }

      let fullminsleft = classes[classes.length-1][1] - minutes;
      fulltimeleft = Math.floor(fullminsleft / 60) + " Hours, " + fullminsleft % 60 + " Minutes left in the day"
    }

    currentPeriod = period;
  }

  function getPeriod(minutes: number): number | [number] | undefined {
    if (minutes < classes[0][0] || minutes > classes[classes.length - 1][1])
      return undefined;
    for (let [i, period] of classes.entries()) {
      if (minutes < period[1]) {
        if (minutes < period[0]) return [i];
        return i;
      }
    }
  }

  function formatDate(date): string {
    let hours = Math.floor(date / 60);
    let minutes = date % 60;
    return (
      (hours > 12 ? hours - 12 : hours) +
      ":" +
      addleadingzero(minutes) +
      " " +
      (hours > 12 ? "PM" : "AM")
    );
  }
  function addleadingzero(s:number){
    if (s < 10){
    return "0"+s.toString()
    }
    return s;
  }

  function formatPeriodName(period) {
    return period == "break"
      ? period
      : period == 0
      ? "Homeroom"
      : "Period " + period;
  }
</script>

<main class="dark">
  <div class="opacity-40">
    <Background />
  </div>
  <div class = "hidden">
  <TopBar title = "Schedule"/>
  </div>
  <div class="items-center justify-center">
    <div class="dark opacity-80">
      <p class="text text-2xl text-center">{timestring}</p>
      {#if currentPeriod != undefined}
        {#each classes as period, i}
          <div class={currentPeriod == i ? "darkp1" : i % 2 == 0 ? "darkm2" : "darkm3"}>
            <p class="text text-lg">
              {formatPeriodName(i)} : {formatDate(period[0])} - {formatDate(
                period[1]
              )}
            </p>
          </div>
        {/each}
        <div class = "dark">
          <p class = "text text-2xl">
          {#if currentPeriod[0]}
            {timeleft} until {formatPeriodName(currentPeriod)}
          {:else}
            {timeleft} left for {formatPeriodName(currentPeriod)} 
          {/if}
          </p>
          <br>
          <p class = "text text-xl">
            {fulltimeleft}
          </p>
        </div>
      {:else}
        <p class="text text-2xl">School is not in session</p>
      {/if}
    </div>
  </div>
</main>

<style>
</style>
