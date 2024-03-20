import { GameState, redrawLevelProgress } from "@/game_state/game_state";
import { GameResult, UserState } from "./sheme";


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
export function getMaxProgressForLevel(level: number) {
    getResultsIDB().then((data: Array<GameResult>) => {
        const res = data.filter((obj) => level === obj.level);
        let max = res[0];
        for (let i = 1; i < res.length; i++) {
            if (max.score < res[i].score) {
                max = res[i];
            }
        }
        max ? redrawLevelProgress(max) : redrawLevelProgress(null);
    });
}
export function getStateLevel(level: number) {
    return getResultsIDB().then((data: Array<GameResult>) => {
        const res = data.filter((obj) => level === obj.level);
        for (let i = 0; i < res.length; i++) {
            if (res[i].isWin) {
                return true;
            }
        }
        return false;
    });
}
function openIDB(): IDBOpenDBRequest {
    return window.indexedDB.open(GameState.IDBobject().name, GameState.IDBobject().version);
}
// userProgressDB
export function openUPIndexDB() {
    const req = window.indexedDB.open("NovaArcanoidUP", GameState.state.indexDB.version);
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
    }
}
export function saveUPResultIDB(object: UserState) {
    const req = window.indexedDB.open("NovaArcanoidUP", GameState.state.indexDB.version);
    req.onsuccess = (event) => {
        console.log("On Upgrade UP_DB")
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
export function getUPResultsIDB() {
    return new Promise((res) => {
        const req = window.indexedDB.open("NovaArcanoidUP", GameState.state.indexDB.version);
        req.onsuccess = (event) => {
            const db = event.target.result as IDBDatabase;
            const store = db.transaction(GameState.IDBobject().store, "readonly").objectStore(GameState.IDBobject().store).get(1);
            store.onsuccess = () => {
                res(store.result);
            }
            store.onerror = () => {
                console.log("Error");
                res(false);
            }
        }
    })
}
