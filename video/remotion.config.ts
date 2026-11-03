/**
 * Inställningar för Remotion-CLI:t (studio, still och render).
 * Alla options: https://remotion.dev/docs/config
 */
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Skarp text: PNG-bildrutor, h264 med låg CRF och yuv420p (spelas överallt).
Config.setVideoImageFormat("png");
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");

// Bara i molnmiljöer där Remotion inte kan ladda ner sin egen webbläsare:
// REMOTION_BROWSER=/sökväg/till/chrome npx remotion render ...
// Lokalt behövs inget, Remotion hämtar sin webbläsare själv.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
  Config.setChromeMode("chrome-for-testing");
}
