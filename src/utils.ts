
import { ajax } from "jquery";

export function readFile(path : string) : Promise<string>
{
    return new Promise<string>((resolve, reject) => 
    {
        ajax({
            url: `${location.origin}/${path}`,
            success: (message) =>
            {
                resolve(message);
            },
            error: (_request, _status, err) =>
            {
                alert(`Failed to read ${path}: ${err}`);
                reject(`Failed to read ${path}: ${err}`);
            }
        });
    });
}

export function randomFloat(min: number, max: number) : number
{
    return Math.random() * (max - min) + min;
}