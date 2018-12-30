import {Vector3} from 'three'
import GameEventEmitter from './GameEventEmitter'

interface GameEvent {
	name: string
	sender: GameEventEmitter
	position: Vector3
}

function GameEvent(e: GameEvent) {
	return {
		name: e.name,
		sender: e.sender,
		position: e.position
	}
}

export default GameEvent
