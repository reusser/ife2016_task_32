const components = []; //所有创建的表单组件容器

let [typeArea, configArea, inputTypeArea, optionArea, lenRuleArea, textareaArea] = document.getElementsByTagName('fieldset');
let [inputRadio, radioRadio, checkboxRadio, selectRadio, textareaRadio] = typeArea.getElementsByTagName('input');
let [componentName, need, needless] = configArea.getElementsByTagName('input');
let [optionInput] = optionArea.getElementsByTagName('input');
let form          = document.getElementById('form');
let submitBtn     = document.getElementById('submit-btn');
let optionBox     = document.getElementById('option-box');
let addBtn        = document.getElementById('add-btn');


//配置器
let configurator = {
	type: inputRadio.value,
	isRequired: true,
	componentOption: [],
	//绑定事件
	init() {
		typeArea.onchange   = () => { this.typeRadioChange() };
		need.onchange       = () => { this.configChange() };
		needless.onchange   = () => { this.configChange() };
		addBtn.onclick      = () => { this.sendData() };

        optionInput.onkeyup = (event) => {
        	if (event.keyCode == 13) {
        		this.addOption(optionInput.value.trim());
        		optionInput.value = '';
        	}
        };

        optionBox.onclick   = (event) => {
        	if (event.target.tagName.toLowerCase() === 'span') {
        		this.delOption(event.target);
        	}
        }
	},
	//组件类型切换的处理事件
	typeRadioChange() {
        if (inputRadio.checked) {

        	this.type = inputRadio.value;
        	componentName.value = inputRadio.parentNode.innerText.trim();

        	inputTypeArea.className = 'show';
        	lenRuleArea.className   = 'show';
        	optionArea.className    = 'hide';
        	textareaArea.className  = 'hide';

        } else if (radioRadio.checked 
        	|| checkboxRadio.checked 
        	|| selectRadio.checked)  {
            
            let flag = null;
            radioRadio.checked ? flag = radioRadio : 
            checkboxRadio.checked ? flag = checkboxRadio : flag = selectRadio;
            this.type = flag.value;
            componentName.value = flag.parentNode.innerText.trim();

        	optionArea.className    = 'show';
        	inputTypeArea.className = 'hide';
        	lenRuleArea.className   = 'hide';
        	textareaArea.className  = 'hide';

        } else if (textareaRadio.checked) {

        	this.type = textareaRadio.value;
        	componentName.value = textareaRadio.parentNode.innerText.trim();

            textareaArea.className  = 'show';
            optionArea.className    = 'hide';
            inputTypeArea.className = 'hide';
        	lenRuleArea.className   = 'hide';
        	
        }
	},
	//组件配置切换的和处理事件
	configChange() {
        need.checked ? this.isRequired = true : this.isRequired = false;
	},
	//添加选项框选项
	addOption(text) {
        this.componentOption = [...this.componentOption, ...text.split(/[^0-9a-zA-Z\u4e00-\u9fa5]+/)];
        this.renderOption();
	},
	//删除选项框选项
	delOption(target) {
		let options = optionBox.getElementsByTagName('span');
        for (let i = 0; i < options.length; i++) {
        	if (options[i] === target) {
        		this.componentOption.splice(i, 1);
        		break;
        	}
        }
        this.renderOption();
	},
	//预览选项
	renderOption() {
        let text = '';
        this.componentOption.forEach( (item) => {
        	text += `<span>${item}</span>`;
        } );
        optionBox.innerHTML = text;
	},
	//获取文本框类型
	getInputType() {
		let inputType = '';
		let inputs = inputTypeArea.getElementsByTagName('input');
        let length = inputs.length;
        for (let i = 0; i < length; i++) {
        	if (inputs[i].checked) {
        		inputType = inputs[i].value;
        		break;
        	}
        }
        return inputType;
	},
	//获取文本框字符长度
	getlengthRule() {
        let [minNum] = document.getElementsByName('minNum');
        let [maxNum] = document.getElementsByName('maxNum');
        return [minNum.value, maxNum.value];
	},
	//获取多行文本框行列数
	gettextAreaControl() {
        let [row, col] = textareaArea.getElementsByTagName('input');
        return [row.value, col.value];
	},
	//获取所有配置信息
	getData() {
        if (this.type == 'input') return {
        	type: this.type,
        	componentName: componentName.value,
        	isRequired: this.isRequired,
        	inputType: this.getInputType(),
        	length: this.getlengthRule()
        }
        if (this.type == 'radio' || this.type == 'checkbox' || this.type == 'select') {
        	if (this.componentOption.length == 0) return false;
        	
        	return {
        		type: this.type,
        	    componentName: componentName.value,
        	    isRequired: this.isRequired,
        	    componentOption: this.componentOption
        	}
        	
        }
        if (this.type == 'textarea') return {
        	type: this.type,
        	componentName: componentName.value,
        	isRequired: this.isRequired,
        	textareaControl: this.gettextAreaControl()
        }
	},
	//发送配置信息
	sendData() {
		if (this.getData()) {
			observer.receive(this.getData());
			this.componentOption = [];
			this.renderOption();
		} else {
			return alert('选项不能为空！');
		}
		
	}
};



//观察者模式
let observer = {
	receive(data) {
		let component = new formFactory(data);
		components.push(component);
		component[this.chooseCreate(data)](data); 
		component.init();
	},
    chooseCreate({type}) {
    	if (type === 'input') return 'createInput';
    	if (type === 'radio' || type === 'checkbox') return 'createChooseBox';
    	if (type === 'select') return 'createSelect';
    	if (type === 'textarea') return 'createTextArea';
    }
};


//表单生成器 
function formFactory ({type, isRequired, length}) {
	this.type       = type;
	this.isRequired = isRequired;
	this.container  = form;
	this.length     = length ? length : undefined;
	this.info       = '';
	this.infoBox    = undefined;
	this.element    = undefined;
}


formFactory.prototype = {
    //绑定事件
    init() {
    	if (this.type === 'input') {

    		this.element.onchange = () => {
    			validator.render(this, validator.validateInputHandler(this.element.value, this));
    		
    		}
    	} else if (this.type === 'radio' || this.type === 'checkbox' || this.type === 'select') {
    		
    		this.element.onchange = () => {
    			validator.render(this, {result: 'success', msg: '已选择'});
    		
    		}
    	} else if (this.type === 'textarea') {
    		
    		this.element.onchange = () => {
    			validator.render(this, validator.validateTextArea(this));
    		}
    	
    	}
    },
    //创建文本框组件
	createInput({componentName, inputType}) {

		let component = document.createElement('input');
		let label     = document.createElement('label');
		let p         = document.createElement('p');
		let [minNum, maxNum] = this.length;
		this.element = component;
		this.infoBox = p;
		component.setAttribute('type', inputType);

		if (this.isRequired) {
			component.setAttribute('required', 'required');
			if (inputType === 'number') this.info = '必填';
			else this.info = `必填 字符长度应为${minNum} -- ${maxNum}位 中文占两位`;
		} else {
			if (inputType === 'number') this.info = '选填';
			else this.info = `选填 字符长度应为${minNum} -- ${maxNum}位 中文占两位`;
		}

		p.className = 'info';
		p.innerHTML = this.info;
		label.innerText = componentName;
		label.appendChild(component);
		this.insert(label);
		this.insertAfter(p, label);
	},
	createChooseBox({componentName, componentOption}) {
		if (this.type === 'radio' || this.type === 'checkbox') {
			this.createRadioOrCheckbox(componentName, componentOption);
		} else {
			this.createSelect(componentName, componentOption);
		}
	},
	//创建单选框或多选框组件
	createRadioOrCheckbox(componentName, componentOption) {
		let label    = document.createElement('label');
		let p        = document.createElement('p');
		let options  = '';
		this.info    = this.isRequired ? '必填选项' : '选填选项';
		this.infoBox = p;
		this.element = label;

		componentOption.forEach( (item) => {
			options += `<label><input type="${this.type}" name="${componentName}" value="${item}">${item}</label>`;
		} );

		label.innerHTML = componentName + options;
		p.className     = 'info';
		p.innerHTML     = this.info;
		this.insert(label);
		this.insertAfter(p, label);
	},
	//创建下拉列表
	createSelect({componentName, componentOption}) {
		let selectBox  = document.createElement('div');
		let select     = document.createElement('select');
		let span       = document.createElement('span');
		let p          = document.createElement('p');
		span.innerHTML = componentName;
		let options    = '';
		this.info      = this.isRequired ? '必填选项' : '选填选项';
		this.element   = select;
		this.infoBox   = p;

		componentOption.forEach( (item) => {
			options += `<option value="${item}">${item}</option>`;
		});
		select.innerHTML    = options;
		p.innerHTML         = this.info;
		p.className         = 'info';
		selectBox.className = 'selectBox';
		selectBox.appendChild(span);
		selectBox.appendChild(select);
		selectBox.appendChild(p);
		this.insert(selectBox);
	},
	//创建文本域
    createTextArea({componentName, textareaControl}) {
    	let [rows, cols] = textareaControl;
    	let textAreaBox  = document.createElement('div');
    	let span         = document.createElement('span');
    	let textArea     = document.createElement('textarea');
    	let p            = document.createElement('p');
    	this.info        = this.isRequired ? '必填' : '选填';
    	this.infoBox     = p;
    	this.element     = textArea;
    	p.innerHTML      = this.info;
    	p.className      = 'info';

        span.innerHTML= componentName;
        textAreaBox.className = 'textAreaBox';
    	textArea.setAttribute('rows', rows);
    	textArea.setAttribute('cols', cols);
    	textAreaBox.appendChild(span);
    	textAreaBox.appendChild(textArea);
    	textAreaBox.appendChild(p)
    	this.insert(textAreaBox);
    },
    insertAfter(ele, refrenceNode){
    	if (refrenceNode.nextElementSibling) {
    		this.container.insertBefore(ele, refrenceNode.nextElementSibling);
    	} else {
    		this.container.appendChild(ele);
    	}
    },
    insert(ele) {
    	this.container.insertBefore(ele, submitBtn);
    }
}


//检测器
let validator = {
	//检测输入的字符长度
	validateInputLength(text) {
		text = text.trim();
		let countLength = 0;
		for (let i = 0; i < text.length; i++) {
			let countCode = text.charCodeAt(i);
			if (countCode >= 0 && countCode <= 128) {
				countLength += 1;
			} else {
				countLength += 2;
			}
		}
		return countLength;
	},
	//检测长度是否符合要求
	validateInputHandler(text, {element, isRequired, length:[minNum, maxNum]}) {
		let textCodeLength = this.validateInputLength(text);
		
		if (element.getAttribute('type') === 'number' && textCodeLength === 0) return {result: 'error', msg: '必填项不能为空'}; 
		if (textCodeLength === 0 && isRequired) return {result: 'error', msg: '必填项不能为空'};
		if (textCodeLength === 0 && !isRequired) return {result: 'info', msg: `选填 字符长度应为${minNum} -- ${maxNum}位 中文占两位`};
		if ((textCodeLength < minNum || textCodeLength > maxNum) && element.getAttribute('type') !== 'number') return {result: 'error', msg: `长度应为${minNum} -- ${maxNum}位`};
		return {result: 'success', msg: '格式正确'};

	},
	//检测文本域
	validateTextArea({isRequired, element}) {
		if (isRequired) return element.value ? {result: 'success', msg: '已填写'} : {result: 'success', msg: '必填项不能为空'};
	},
	//提交表单时检测事件，选项组件应该也是在提交时进行检测
	validateSubmit(obj) {
		if (obj.isRequired) {
			/*if ((obj.type === 'input' || obj.type === 'textarea') && !obj.element.value) return {result: 'error', msg: '必填项不能为空'};*/
			if (obj.type === 'input') return validator.validateInputHandler(obj.element.value, obj);
			if (obj.type === 'textarea') return validator.validateTextArea(obj.element.value, obj);
			if (obj.type === 'radio' || obj.type === 'checkbox') {
				let flag = 0;
				let eles = obj.infoBox.parentNode.getElementsByTagName('input');
				for (let i = 0; i < eles.length; i++) {
					if (eles[i].checked) break;
					flag = i;
				}
				if (flag === eles.length - 1) {
					return {result: 'error', msg: '未选择选项！'};
				}
			}

			if (obj.type === 'select' && obj.element.selectedIndex < 0) {
				return {result: 'error', msg: '未选择选项！'};
			}
		}
		return {result: 'success', msg: '通过验证!'};
	},
	//显示验证结果
	render(obj, {result, msg}) {
		if (obj.element) obj.element.className = result;
		obj.infoBox.className = result;
		obj.infoBox.innerHTML = msg;
	}
}


window.onload = () => {

	submitBtn.onclick = () => {
		let flag = true; 
		if (components.length === 0) {
			alert('没有内容可以提交');
			return false;
		}
		components.forEach( (item) => {
			validator.render(item, validator.validateSubmit(item));
			if (item.infoBox.className === 'error') flag = false;
		} );

		if (!flag) {
			alert('表单有误，无法提交，请按要求填写表单');
			form.onsubmit = () => {
				return false;
			}
		} else {
			alert('提交成功');
			form.onsubmit = () => {
				return true;
			}
		}

	}

	configurator.init();
}