import { GameState } from "@/game_state/game_state";
import { GameResult } from "./sheme";


export function openIndexDB() {
    const req = window.indexedDB.open(GameState.state.indexDB.name, GameState.state.indexDB.version);
    req.onsuccess = (event) => {
        // console.log("IndexDB success")
    }
    req.onerror = (event) => {
        //console.error("IndexDB error:", event.target.errorCode);
    }
    req.onupgradeneeded = (event) => {
        // console.log("IndexDB upgrade")
        const db = event.target.result as IDBDatabase;
        const store = db.createObjectStore(GameState.IDBobject().store, { autoIncrement: true });
        store.createIndex("level", "level", { unique: false });
    }
}
export function saveResultIDB(object: GameResult) {
    const req = openIDB();
    req.onsuccess = (event) => {
        console.log("On Upgrade DB")
        const db = event.target.result;
        const store = db.transaction(GameState.IDBobject().store, "readwrite").objectStore(GameState.IDBobject().store);

        store.transaction.oncomplete = (event) => {
            // console.log("Transaction complete")
        }
        store.transaction.onerror = (event) => {
            //console.error("Transaction error: ", event.type.errorCode);
        }
        store.add(object);
    }

}
export function getResultsIDB() {
    return new Promise((res) => {
        const req = openIDB();
        const values = [];
        req.onsuccess = (event) => {
            const db = event.target.result as IDBDatabase;
            const store = db.transaction(GameState.IDBobject().store, "readonly").objectStore(GameState.IDBobject().store);
            const query = store.index("level");
            query.openCursor().onsuccess = (event) => {
                const cur = event.target.result;
                if (cur) {
                    values.push(cur.value);
                    cur.continue();
                } else {
                    res(values);
                    // console.log("Cursor completed")
                }
            }
        }
    })
}
function openIDB(): IDBOpenDBRequest {
    return window.indexedDB.open(GameState.IDBobject().name, GameState.IDBobject().version);
}
