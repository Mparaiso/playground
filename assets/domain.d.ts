declare module playground{
    /**
     * Represent and editor configuration
     */
    interface Editor{
        /* script,tags,style ...*/
        type:string;
        /* content of the editor */
        value:string;
        /* html,javascript,typescript,css...*/
        language:string;
    }
    interface Gist{
        description:string;
        files:File[];
        'public':boolean;
        tags:String[];
        user:User;
        createdAt:Date;
        updatedAt:Date;
        ACL:any;
    }
    interface User{
        username:string;
        password:string;
    }
    interface File{
        active:boolean;
        language:string;
        placeholder:string;
        type:string;
        value:string;
    }
}
