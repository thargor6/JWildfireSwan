import { Button } from '@hilla/react-components/Button.js';
import { Notification } from '@hilla/react-components/Notification.js';
import { TextField } from '@hilla/react-components/TextField.js';
import { HelloReactEndpoint } from 'Frontend/generated/endpoints';
import { useState } from 'react';
import { useStores } from "../../use-stores";
import { observer } from "mobx-react-lite";

const HelloReactView = observer(() => {
  const [name, setName] = useState('');
  const { appStore } = useStores();

  return (
    <>
      <section className="flex p-m gap-m items-end">
          <h1>{appStore.applicationName} ({appStore.testItems.length})</h1>
        <TextField
          label="Your name"
          onValueChanged={(e) => {
            setName(e.detail.value);
          }}
        />
        <Button
          onClick={async () => {
              appStore.applicationName = appStore.applicationName + "2";
            const serverResponse = await HelloReactEndpoint.sayHello(name);
            Notification.show(serverResponse);
          }}
        >
          Say hello
        </Button>
      </section>
    </>
  );
});

export default HelloReactView;

