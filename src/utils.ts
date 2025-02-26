
import { ajax } from "jquery";

export async function readFile(path : string) : Promise<string | null>
{
    var result = "";
    try
    {
        await ajax({
            url: location.origin + "/" + path,
            async: true,
            success: function (message)
            {
                result = message;
            },
        });
    }
    catch (err)
    {
        alert(`Failed to read ${path}: ${err}`);
        return null;
    }

    console.log(`readFile(${path}): \n${result}`);
    return result;
}

export function randomFloat(min: number, max: number) : number
{
    return Math.random() * (max - min) + min;
}