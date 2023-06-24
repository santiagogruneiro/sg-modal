let builtModal

(() => {
    let modal = new sgModal(
        {
            mode: 'crud',
            columns:[
                {field:'id',title:'ID',type:'number',editor:{editable:false}},
                {field:'cliente',title:'Cliente',type:'string',editor:{editable:true}},
                {field:'ventas',title:'Ventas',type:'number',editor:{editable:true}},
        ],
            title:'Testing modal',
            okCallback: (sender) => {
                console.dir('saving!')
            },
            primaryColor:'#34303B',
            footer:{
            }
        }
    ) 
        modal.action('edit').setRowDataItem({id:1,cliente:'Santiago',ventas:5}).openModal()
})()