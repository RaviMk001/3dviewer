<template>
  <div
    class="three-container"
    ref="three-container"
  >
    <div class="three-overlay">
      <div v-if="error != null" class="mb-3" style="color: red; center;">
        An error occured when loading the USDZ file. Maybe this file is not
        supported or the loader is not supported on this device.
      </div>
      <input
        type="file"
        multiple
        v-show="false"
        name="fields[assetsFieldHandle][]"
        class="w-px h-px opacity-0 overflow-hidden absolute"
        ref="file"
        accept=".usdz"
      />
    </div>
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title class="text-h5">
          Information about the player
        </v-card-title>

        <v-card-text class="mt-2">
          This player is based on the
          <a href="https://www.npmjs.com/package/three-usdz-loader"
            >three-usdz-loader</a
          >
          package<br />
          Contact: contact@usdz-viewer.net
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script src="./Home.ts"></script>
<style src="./Home.scss" lang="scss"></style>
