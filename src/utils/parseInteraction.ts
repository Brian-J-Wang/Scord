export interface Interaction {
    type: number,
    token: string,
    name: string,
    guild: string,
    user: {
        name: string,
        id: string,
    },
    options: any
}

//contains the name of the button pressed.
export interface Button {
    button: string
}

//contains the name of the focused element
export interface Autocomplete {
    focused: string
}

//parses the interaction object into a more concise format.
export function parseInteraction(body : any) : Interaction {
    console.log(body);

    const output : Interaction = {
        type: body.type,
        token: body.token,
        name: body.data.options[0].name,
        guild: body.guild_id,
        user: {
            name: body.member.user.global_name,
            id: body.member.user.id
        },
        options: {}
    };

    if (body.data.options[0].options.length != 0) {
        body.data.options[0].options.forEach((element : any) => {
            output.options[element.name] = element.value;
        });
    }

    return output;
}

export function parseMessageComponent(body : any) : Interaction & Button {
    const output : Interaction & Button = {
        type: body.type,
        token: body.token,
        button: "",
        name: body.message.interaction.name,
        guild: body.guild_id,
        user: {
            name: body.member.user.global_name,
            id: body.member.user.id
        },
        options: {}
    }

    const cId = body.data.custom_id.split(":");
    output.options[cId[0]] = cId[1];
    output.button = cId[0];

    return output;
}

export function parseAutocomplete(body : any) : Interaction & Autocomplete {
    const output : Interaction & Autocomplete = {
        type: body.type,
        token: body.token,
        name: body.data.options[0].name,
        guild: body.guild_id,
        user: {
            name: body.member.user.global_name,
            id: body.member.user.id
        },
        focused: "",
        options: {}
    }

    if (body.data.options[0].options.length != 0) {
        body.data.options[0].options.forEach((element : any) => {

            output.options[element.name] = element.value;

            if (element.focused) {
                output.focused = element.name;
            }
        });
    }

    return output;
}