/* eslint-disable @typescript-eslint/no-explicit-any */
import { INotification } from "../modules/Notification/notification.interface";
import { Notification } from "../modules/Notification/notification.model";


export const sendNotifications = async (data:any):Promise<INotification> =>{
    const result = await Notification.create(data);
    return result;
}