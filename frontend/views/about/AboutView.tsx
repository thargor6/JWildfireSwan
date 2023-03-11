import {observer} from "mobx-react-lite";
import {useStores} from "Frontend/use-stores";
import {AppTestItemProps} from "Frontend/stores/app-store";
import {Button} from '@hilla/react-components/Button.js';
import {useState} from "react";

interface AboutViewItemProps {
    item: AppTestItemProps;
}
function AboutViewItem(props: AboutViewItemProps) {
    const [item, setItem] = useState(props.item);

    return (
        <div>
             {item.firstName} {item.lastName} Age: {item.age}

            <Button
                onClick={async () => {
                    setItem( { firstName: item.firstName, lastName: item.lastName, age: Math.round(10 + Math.random() * 100)} );
                }}
            >
                Change item
            </Button>
        </div>
    );
}

const AboutView = observer(() => {
    const {appStore} = useStores();

    return (
        <div className="flex flex-col h-full items-center justify-center p-l text-center box-border">
            <h2>{appStore.applicationName} ({appStore.testItems.length})</h2>
            <img style={{width: '200px'}} src="icons/swan_logo_200.png"/>
            {appStore.testItems.map((item) => <AboutViewItem item={item}></AboutViewItem>)}
            <Button
                onClick={async () => {
                    appStore.testItems = appStore.testItems.concat([{
                        firstName: "Jo",
                        lastName: "Jo",
                        age: Math.round(10 + Math.random() * 100)
                    }]);
                }}
            >
                Add item
            </Button>
            <Button
                onClick={async () => {
                    appStore.testItems = [];
                }}
            >
                Clear items
            </Button>
            <h2>This place intentionally left empty</h2>
            <p>It’s a place where you can grow your own UI 🤗</p>
        </div>
    );
});

export default AboutView;
