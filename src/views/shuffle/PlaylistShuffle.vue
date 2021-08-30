<template>
  <h2>Randomize playlist order</h2>

  <component :is="currentComponent" />
</template>

<script lang="ts">
  import { defineComponent, provide, shallowRef } from "vue";
  import PlaylistShuffleStep1 from "@/views/shuffle/PlaylistShuffleStep1.vue";
  import PlaylistShuffleStep2 from "@/views/shuffle/PlaylistShuffleStep2.vue";
  import { ShuffleGotoStepKey } from "@/data/injections";

  export default defineComponent({
    name: "PlaylistShuffle",
    components: { PlaylistShuffleStep1, PlaylistShuffleStep2 },

    setup() {
      const currentComponent = shallowRef<unknown>(PlaylistShuffleStep1);

      const gotoStep = (step: number) => {
        switch (step) {
          case 1: {
            currentComponent.value = PlaylistShuffleStep1;
            break;
          }
          case 2: {
            currentComponent.value = PlaylistShuffleStep2;
            break;
          }
          default: {
            throw new Error(`Unknown PlaylistShuffle step ${step}`);
          }
        }
      };

      provide(ShuffleGotoStepKey, gotoStep);

      return {
        currentComponent,
      };
    },
  });
</script>