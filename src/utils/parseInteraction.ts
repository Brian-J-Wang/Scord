export interface Interaction {
    type: number,
    token: string,
    name: string,
    guild: string,
    user: string,
    options: any
}

//contains the name of the button pressed.
export interface Button {
    button: string
}

//parses the interaction object into a more concise format.
export function parseInteraction(body: any) : Interaction {
    const output : Interaction = {
        type: body.type,
        token: body.token,
        name: body.data.options[0].name,
        guild: body.guild_id,
        user: body.member.user.id,
        options: {}
    };

    if (body.data.options[0].options.length != 0) {
        body.data.options[0].options.forEach((element : any) => {
            output.options[element.name] = element.value;
        });
    }

    console.log(output);
    return output;
}

export function parseMessageComponent(body : any) : Interaction & Button {
    const output : Interaction & Button = {
        type: body.type,
        token: body.token,
        button: "",
        name: body.message.interaction.name,
        guild: body.guild_id,
        user: body.member.user.id,
        options: {}
    }

    const cId = body.data.custom_id.split(":");
    output.options[cId[0]] = cId[1];
    output.button = cId[0];

    console.log(output);

    return output;
}

export default parseInteraction