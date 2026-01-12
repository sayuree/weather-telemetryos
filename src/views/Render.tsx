import { useEffect, useState } from "react";
import { store } from "@telemetryos/sdk";
import type { ViewConfig } from "./ViewConfig";
import { VIEW_REGISTRY } from "./index";

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function Render() {
  const [config, setConfig] = useState<ViewConfig | undefined>(undefined);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    store().instance.get<ViewConfig>("viewConfig").then(setConfig);

    store()
      .instance.subscribe("viewConfig", (newConfig: ViewConfig | undefined) => {
        setConfig(newConfig);
      })
      .then((unsub) => {
        unsubscribe = unsub as unknown as () => void;
      });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (!config) {
    return <div>Please configure the app in Settings</div>;
  }

  const SelectedView = VIEW_REGISTRY[config.selectedView];

  return <SelectedView />;
}
