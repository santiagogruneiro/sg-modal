

class sgModal {
    /**
    * Modal constructor.
    * @param {ModalOptions} modalOptions 
    */
    constructor(modalOptions) {
        if (modalOptions)
            this.#modalOptions = { ...this.#modalOptions, ...modalOptions }
        sgModal.instances.push(this)
    }

    /** @type {ModalOptions} */
    #modalOptions = {
        columns: [],
        title: '',
        action: '',
        primaryColor: '',
        deleteTitleItemField: '',
        bodyTemplate: '',
        okCallback: () => { },
        footer:{direction:''}
    }

    static instances = []

    #currentFieldDataType = 'string'
    #rowIdx = undefined;
    #dataItem = undefined;

    #formFieldClass = 'sg-form-field'

    #defaultValuesByDataType = {
        string: '',
        number: 0,
    }

    #defaultTitles = {
        add: 'Nuevo registro',
        edit: 'Editar registro',
        delete: 'Eliminar'
    }
    #modalInputTypesConfig = {
        'string': 'text',
        'number': 'number',
        'object': 'date'
    }

    #modalEditorTypes = {
        'input': (controlName, disabled) => this.#buildInputEditor(controlName, disabled),
        'dropdown': (controlName, disabled) => this.#buildDropDownEditor(controlName, disabled),
    }
    #modalModesBuild = {
        'crud': () => this.#buildModalCrud(),
        'custom': () => this.#buildModalCustom(),
        '': () => { return '' }
    }

    openModal() {
        let body = document.getElementsByTagName('body')[0]
        debugger;
        let modalHtml = this.#buildModal()
        let wrapper = document.getElementsByClassName('sg-modal-wrapper')[0]
        wrapper.innerHTML = modalHtml

        const modalDOM = document.getElementsByClassName('sg-modal')[0]
        const modalBackdropDOM = document.getElementsByClassName('sg-modal-backdrop')[0]
        modalBackdropDOM.classList.add('show')
        modalDOM.style.display = 'block'
        body.classList.add('sg-modal-open')

        let timer = setTimeout(() => {
            modalDOM.classList.add('show')
            clearTimeout(timer)
        }, 100);


        this.#assignEvents(modalDOM)
        this.#setStyling(modalDOM);
    }

    closeModal = () => {
        let wrapper = document.getElementsByClassName('sg-modal-wrapper')[0]
        document.body.classList.remove('sg-modal-open')

        const modalDOM = document.getElementsByClassName('sg-modal')[0]
        const modalBackdropDOM = document.getElementsByClassName('sg-modal-backdrop')[0]
        modalDOM.classList.remove('show')

        let timer = setTimeout(() => {
            modalBackdropDOM.classList.remove('show')
            clearTimeout(timer)
        }, 100);

        let timer2 = setTimeout(() => {
            modalDOM.style.display = 'none'

            if (wrapper) {
                wrapper.parentElement?.removeChild(wrapper)
            }
            clearTimeout(timer2)
        }, 200);


        this.#clearValues()

    }
    setRowDataItem = (dataItem) => {
        this.#dataItem = dataItem

        return this
    }
    setRowIndex = (idx) => {
        this.#rowIdx = idx
    }
    setDeleteTitleField(field) {
        this.#modalOptions.deleteTitleItemField = field;
    }

    /**
    * Sets the CRUD action: 'edit', 'delete', 'add'
    * @param {string} action 
    */
    action(action) {
        this.#modalOptions.action = action

       return this
    }


    #buildModal = () => {
        let wrp = document.createElement('div')
        wrp.classList.add('sg-modal-wrapper')
        wrp.setAttribute('tabindex', '-1')
        wrp.style.position = 'relative'
        wrp.style.zIndex = '1050'
        wrp.style.display = 'block'

        document.body.appendChild(wrp)

        let wrapper = ` <div>
                  #modal#
                  #backdrop#
            </div>`

        let backdrop = backdropTemplate

        let modal = ``;

        const modalBuilder = this.#modalModesBuild[this.#modalOptions.mode]

        modal = modalBuilder()

        wrapper = wrapper.replace('#modal#', modal).replace('#backdrop#', backdrop)

        return wrapper
    }
    #buildModalCustom() {
        let modal = modalTemplate;

        modal = modal
            .replace('#headertitle#', this.#modalOptions.title || '')
            .replace('#body#', this.#modalOptions.bodyTemplate)
            .replace('#footer#', modalFooterTemplate.replace('#action#', this.#modalOptions.action))
            .replace('#repeat#', '1')

        return modal;

    }
    #buildModalCrud() {
        let modal = ``
        if (this.#modalOptions.action == 'edit' || this.#modalOptions.action == 'add') {
            modal = this.#buildModalEditCreate()
        }
        if (this.#modalOptions.action == 'delete') {
            modal = this.#buildModalDelete()
        }
        return modal;
    }
    #buildModalEditCreate() {
        let modal = modalTemplate;
        const blocks = this.#getModalBlocks()

        modal = modal
            .replace('#headertitle#', this.#modalOptions.title || '')
            .replace('#body#', blocks)
            .replace('#footer#', modalFooterTemplate.replace('#action#', this.#modalOptions.action))
            .replace('#repeat#', '2')

        return modal;

    }
    #buildModalDelete() {
        let titleDataItemValue = ``

        try {
            titleDataItemValue = this.#dataItem[this.#modalOptions.deleteTitleItemField] ?
                (' ' + this.#dataItem[this.#modalOptions.deleteTitleItemField]) : ''
        } catch (err) {
            titleDataItemValue = ' '
        }

        let modal = modalTemplate;
        modal = modal.replace('#headertitle#', this.#modalOptions.title || '')
            .replace('#body#', `<p>¿Confirma eliminar el registro${titleDataItemValue || ''}?</p>`)
            .replace('#footer#', modalFooterDeleteTemplate.replace('#action#', this.#modalOptions.action))
            .replace('#repeat#', '1')

        return modal;
    }
    #assignEvents = (modalDOM) => {

        let btnCloseModal = modalDOM.getElementsByClassName('sg-modal-button-close')[0]
        btnCloseModal.addEventListener('click', this.closeModal)

        try {
            let btnSaveModal = modalDOM.getElementsByClassName('sg-modal-button-save')[0]
            btnSaveModal.addEventListener('click', (e) => this.#saveModal(e))
        } catch (error) { }

        try {
            const formFields = modalDOM.getElementsByClassName('sg-form-field')

            Array.from(formFields).forEach((el, idx) => {
                const field = formFields[idx]
                field.addEventListener('change', (e) => this.#formValueChange(e))
            })
        } catch (error) { }

        try {
            let btnDeleteModal = modalDOM.getElementsByClassName('sg-modal-button-delete')[0]
            btnDeleteModal.addEventListener('click', (e) => this.#saveModal(e))
        } catch (error) { }
    }
    #buildInputEditor = (controlName, isDisabled) => {
        let disabled = undefined
        try {
            const obj = {
                dataItem: this.#dataItem,
                action: this.#modalOptions.action
            }
            disabled = isDisabled(obj)
        } catch (error) {

        }
        let template =
            `<input type="${this.#currentFieldDataType}" 
            name="${controlName}" ${disabled ? 'disabled' : ''} 
            class="${this.#formFieldClass}" value="#value#"/>`

        if (this.#dataItem) {
            let val = this.#dataItem[controlName]
            template = template.replace('#value#', val)
        } else template = template.replace('#value#', '')

        return template
    }
    #buildDropDownEditor = (controlName, disabled) => {
        const column = this.#modalOptions.columns.find(x => x.field == controlName)
        if (!column) {
            throw Error('No se encontró la columna')
        }
        const source = column.editor?.source
        const template = `<select name="${controlName}" class="${this.#formFieldClass}">#options#</select>`
        const optionTemplate = `<option #selected# value="#value#">#text#</option>`
        const { textField, valueField } = column.editor
        let optionsString = `<option value="null">Seleccione una opción</option>`

        source?.forEach(row => {
            let option = optionTemplate
                .replace('#value#', row[valueField])
                .replace('#text#', row[textField])

            if (this.#dataItem) {
                let val = this.#dataItem[controlName]
                if (val == row[valueField])
                    option = option.replace('#selected#', 'selected')
            } else option = option.replace('#selected#', '')

            optionsString += option
        })
        return template.replace('#options#', optionsString)
    }
    #getInputTypeSafe(col) {
        let type = ''
        try {
            type = col.editor?.type || 'input'
        } catch (error) {
            type = 'input'
        }

        return type;
    }
    #getModalBlocks() {
        const { columns } = this.#modalOptions

        const sortedColumns = this.#sortColumnsByPosition()
        let modalBlocks = ``

        sortedColumns.forEach(col => {
            // input type
            const type = this.#getInputTypeSafe(col)
            const fn = this.#modalEditorTypes[type]
            this.#currentFieldDataType = this.#getFieldDataTypeSafe(col)
            let element = fn(col.field, col.editor?.disabled)

            //set value if is editing


            const labelText = col.title ? col.title : col.field
            let block = modalBlockTemplate.
                replace('#input#', element).replace('#controlName#', col.field)
                .replace('#labeltext#', labelText)

            modalBlocks += block

        })

        // console.dir(modalBlocks)
        return modalBlocks
    }
    #setColors = (modalDOM) => {
        const { primaryColor } = this.#modalOptions

        let keys = ['primary', 'secondary']
        keys.forEach(key => {
            let colorClass = key + '-color'
            let elements = modalDOM.getElementsByClassName(colorClass)
            elements = Array.from(elements)

            if (key == 'primary') {
                elements.forEach((el) => {
                    if (el.localName == 'button') {
                        el.style.background = primaryColor
                        el.style.color = 'white'
                    } else {
                        el.style.color = primaryColor
                    }

                })
            }
            else {
                elements.forEach((el) => {
                    if (el.localName == 'button') {
                        el.style.background = 'white'
                        el.style.color = primaryColor
                        el.style.border = `1px solid ${primaryColor}`
                    } else {
                        el.style.color = primaryColor
                    }

                })
            }

        })
    }
    #sortColumnsByPosition() {
        const { columns } = this.#modalOptions

        const editableColumns = columns.filter(x => x.editor && x.editor.editable)
        const sortableColumns = editableColumns.filter(x => x.editor?.position)
        const nonSortableColumns = editableColumns.filter(x => !x.editor?.position)

        const sortedColumns = sortableColumns.sort((a, b) => {
            return a.editor.position - b.editor.position
        })

        const columnsSortedConcated = sortedColumns.concat(nonSortableColumns)

        return columnsSortedConcated
    }
    #getFieldDataTypeSafe(col) {
        let dataType = 'string'
        try {
            dataType = col.type || 'string'
        } catch (error) {

        }
        return dataType
    }
    #clearValues() {

        this.#rowIdx = undefined
        this.#currentFieldDataType = undefined
        this.#dataItem = undefined
    }
    #formValueChange(event) {
        const { name, value } = event.target
        if (!this.#dataItem)
            this.#dataItem = this.#getDefaultDataItem()

        this.#dataItem = { ...this.#dataItem, [name]: value }
    }
    #getDefaultDataItem() {
        const { columns } = this.#modalOptions
        let dataItem = {}
        columns.forEach(col => {
            let { field, type } = col

            if (!type)
                type = 'string'

            dataItem = { ...dataItem, [field]: this.#defaultValuesByDataType[type] }
        })

        return dataItem
    }
    #saveModal(evento) {
        let obj = {
            dataItem:this.#dataItem,
            closeModal:this.closeModal
        }
        this.#modalOptions.okCallback(obj)
    }
    #setStyling(modalDOM){
        this.#setColors(modalDOM);
        const footer = document.getElementsByClassName('sg-modal-footer')[0]
        if(this.#modalOptions.footer.direction)
        footer.classList.add(this.#modalOptions.footer.direction)
    }
}

const modalBlockTemplate = `
<div class="sg-modal-body-item">
    <label for="#controlName#">#labeltext#</label>
    #input#
</div>`

const modalFooterTemplate = `
<div class="sg-modal-footer">
    <button type="button" action="#action#" class="sg-modal-button primary-color sg-modal-button-save">Guardar</button>
    <button  type="button" class="sg-modal-button secondary-color sg-modal-button-close">Cancelar</button>
</div>`

const modalFooterDeleteTemplate = `
<div class="sg-modal-footer sg-modal-footer-delete">
    <button type="button" action="#action#" class="sg-modal-button primary-color sg-modal-button-delete">Confirmar</button>
    <button  type="button" class="sg-modal-button secondary-color sg-modal-button-close">Cancelar</button>
</div>`

const modalTemplate =
    `<div class="sg-modal fade" role="dialog" tabindex="-1">
<div class="sg-modal-dialog" role="document">
    <div class='sg-modal-content'>
        <form action="#">
            <div class="sg-modal-header">
                <h5 class="sg-modal-title">#headertitle#</h5>
            </div>
            <div class="sg-modal-body" style="grid-template-columns: repeat(#repeat#, 1fr);">
                 #body#
            </div>
            #footer#
        </form>
    </div>
</div>
</div>`

const backdropTemplate = `<div class="sg-modal-backdrop fade show"></div>`