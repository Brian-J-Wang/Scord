export interface Leaderboard {
    scoreboard_name: string;
    top: [
        {
            id : number,
            name : string,
            score : number,
            position : number,
        }
    ]
    caller: {
        id : number,
        name : string,
        score : number,
        position : number,
    }
}

export interface LeaderboardOptions {
    visibleOnlyToCaller: boolean,
    specialHighlighting: SpecialHighlighting[]
}

interface SpecialHighlighting {
    playerId: number
    prefix: string,
    suffix: string,
}

export function formatLeaderboard(input : Leaderboard, options : LeaderboardOptions) {
    let output = '```ansi\r';
    output += `\u001b[4mScoreboard for \u001b[1m${input.scoreboard_name}\r\u001b[0m\r`;
    output += '\u001b[4;37m\u001b[1mRANK \u001b[0m|\u001b[4;37m\u001b[1m PLAYER\t\t\t\t \u001b[0m|\u001b[4;37m\u001b[1m SCORE\u001b[0m\r'
    input.top.forEach((player) => {

        const specialHighlighting = options.specialHighlighting.find((element) => {
            return element.playerId == player.id
        })

        if (specialHighlighting) {
            output += specialHighlighting.prefix;
            output += parseLine(player);
            output += specialHighlighting.suffix;
        } else {
            output += parseLine(player);
        }        
    })

    const isTopPlayer = input.top.some(player => player.id == input.caller.id);
    if (!isTopPlayer && options.visibleOnlyToCaller) {
        output += '...\r';
        output += parseLine(input.caller);
    }
    
    output += '```';
    return output;

    function parseLine(player: { id?: number; name: any; score: any; position: any; }) {

        let line = `${player.position}.   | `

        if ( player.name.length > 16 ) {
            line += player.name.substring(0, 13);
            line += '...';
        } else if ( player.name.length < 16 ) {
            line += player.name.padEnd(16, ' ');
        }

        line += '\t   | ';
        line += player.score.toString();
        line += '\r'

        return line;
    }
}

