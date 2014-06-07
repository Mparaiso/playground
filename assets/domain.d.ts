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

}
