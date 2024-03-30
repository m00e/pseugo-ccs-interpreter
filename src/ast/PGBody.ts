import { PGAction } from "./PGAction.js"
export class PGBody {
    
    /**
     * 
     * @param actions List of actions ({@link PGAction}).
     */
    constructor(readonly actions: PGAction[]) {}
    
    public toString(): string {
        const actions = `${this.actions.join("\n")}`;
        return `${actions.toString()}`;
    }
}