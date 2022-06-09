import { setupDevtoolsPlugin } from '@vue/devtools-api';
import deepCopy from './deepCopy';
let copyOfState = {};
// copyOfState : {
//   state : [ 
//     proxy {
//       <target> : {
//         counter : 0,
//         colorCode : 'blue'
//       }
//     }
//   ]
// }
//copyOfState[stateName][0].target => undefined
export const getCompState = (state, stateName) => {
    console.log("copyOfState:", copyOfState);
    // shallowref of state?
    if (!copyOfState[stateName]) {
        copyOfState[stateName] = [];
    }
    //copyOfState[stateName].push(state);
    copyOfState[stateName].push(deepCopy(state));
    window.addEventListener('click', event => {
        copyOfState[stateName].push(deepCopy(state));
        console.log("copyOfState:", copyOfState);
    });
    window.addEventListener('keyup', event => {
        // setTimeout(copyOfState[stateName].push(deepCopy(state)), 0);
        // setTimeout(() => console.log("copyOfState:", copyOfState), 0);
        copyOfState[stateName].push(deepCopy(state));
        console.log("copyOfState:", copyOfState);
    });
    // window.addEventListener('click', )
    //  setTimeout(() => {
    //   getCompState(state, stateName)
    //  }, 5000)
};
export function setupDevtools(app, data) {
    const stateType = 'My Awesome Plugin state';
    const inspectorId = 'my-awesome-plugin';
    const timelineLayerId = 'my-awesome-plugin';
    let devtoolsApi;
    let trackId = 0;
    const devtools = {
        trackStart: (label) => {
            const groupId = 'track' + trackId++;
            devtoolsApi.addTimelineEvent({
                layerId: timelineLayerId,
                event: {
                    time: Date.now(),
                    data: {
                        label
                    },
                    title: label,
                    groupId
                }
            });
            return () => {
                devtoolsApi.addTimelineEvent({
                    layerId: timelineLayerId,
                    event: {
                        time: Date.now(),
                        data: {
                            label,
                            done: true
                        },
                        title: label,
                        groupId
                    }
                });
            };
        }
    };
    setupDevtoolsPlugin({
        id: 'my-awesome-devtools-plugin',
        label: 'My Awesome Plugin',
        packageName: 'my-awesome-plugin',
        homepage: 'https://vuejs.org',
        componentStateTypes: [stateType],
        app
    }, api => {
        devtoolsApi = api;
        // api.on.inspectComponent((payload, context) => {
        //   payload.instanceData.state.push({
        //     type: stateType,
        //     key: '$hello',
        //     value: data.message,
        //     editable: false
        //   })
        //   payload.instanceData.state.push({
        //     type: stateType,
        //     key: 'time counter',
        //     value: data.counter,
        //     editable: false
        //   })
        // })
        // setInterval(() => {
        //   api.notifyComponentUpdate()
        // }, 5000)
        // api.on.visitComponentTree((payload, context) => {
        //   const node = payload.treeNode
        //   if (payload.componentInstance.type.meow) {
        //     node.tags.push({
        //       label: 'meow',
        //       textColor: 0x000000,
        //       backgroundColor: 0xff984f
        //     })
        //   }
        // })
        api.addInspector({
            id: inspectorId,
            label: 'Point-Of-Vue!',
            icon: 'visibility',
        });
        api.on.getInspectorTree((payload, context) => {
            if (payload.inspectorId === inspectorId) {
                payload.rootNodes = [];
                for (const key in copyOfState) {
                    payload.rootNodes.push({
                        id: `${key}`,
                        label: `${key}`
                    });
                }
            }
        });
        // 'my section': [
        //   {
        //     key: 'cat',
        //     value: 'meow',
        //     editable: false,
        //   }
        // ]
        api.on.getInspectorState((payload, context) => {
            if (payload.inspectorId === inspectorId) {
                if (copyOfState[payload.nodeId]) {
                    payload.state = {};
                    //add toRaw?
                    const stateObj = copyOfState[payload.nodeId][copyOfState[payload.nodeId].length - 1];
                    console.log('getInspectorState is running');
                    //console.log('toRaw:', toRaw(copyOfState[payload.nodeId][0]))
                    for (const key in stateObj) {
                        payload.state[key] = [
                            {
                                key: key,
                                value: stateObj[key],
                                editable: true
                            }
                        ];
                    }
                }
            }
        });
        // // function set(object, path, value, cb)
        // api.on.editInspectorState(payload => {
        //   if (payload.inspectorId === inspectorId) {
        //     // if (payload.nodeId === 'root') 
        //       payload.set(payload.state, payload.path, payload.state.value)
        //   }
        // })
        setInterval(() => {
            api.sendInspectorTree(inspectorId);
        }, 500);
        api.addTimelineLayer({
            id: timelineLayerId,
            color: 0xff984f,
            label: 'Point-Of-Vue'
        });
        // window.addEventListener('click', event => {
        //   api.addTimelineEvent({
        //     layerId: timelineLayerId,
        //     event: {
        //       time: Date.now(),
        //       data: {
        //         mouseX: event.clientX,
        //         mouseY: event.clientY
        //       }
        //     }
        //   })
        // })
        let eventCounter = 1;
        const getEventState = (index) => {
            const eventState = {};
            for (const key in copyOfState) {
                eventState[key] = copyOfState[key][index];
            }
            return eventState;
        };
        window.addEventListener('click', event => {
            const groupId = 'group-1';
            devtoolsApi.addTimelineEvent({
                layerId: timelineLayerId,
                event: {
                    time: Date.now(),
                    data: getEventState(eventCounter),
                    title: `event ${eventCounter}`,
                    groupId
                }
            });
            eventCounter += 1;
        });
        window.addEventListener('keyup', event => {
            const groupId = 'group-1';
            devtoolsApi.addTimelineEvent({
                layerId: timelineLayerId,
                event: {
                    time: Date.now(),
                    data: getEventState(eventCounter),
                    title: `event ${eventCounter}`,
                    groupId
                }
            });
            eventCounter += 1;
        });
    });
    return devtools;
}
