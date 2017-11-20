import { bindable, bindingMode, autoinject, customElement } from "aurelia-framework";
import * as keycode from "keycode";

@customElement("paj-combobox-static")
@autoinject
export class ComboBox {
    @bindable items: any[];
    @bindable({defaultBindingMode: bindingMode.twoWay}) selected: any;
    @bindable({defaultValue: "300px"}) width: string;
    searching: boolean;
    noResults: boolean;
    opened: boolean;
    highlightedIndex: number;
    highlighted: any;
    selectedIndex: number;
    keyListener: any;
    clickListener: any;

    searchText: string;

    searchElement: Element;
    searchTextElement: Element;
    noResultsElement: Element;
    dropdownElement: Element;
    displayElement: Element;

    constructor(private element: Element) {
        this.opened = false;
        this.selectedIndex = null;
        this.highlightedIndex = null;
    }

    public attached() {
        this.keyListener = (keyEvent) => {
            this.onKeyDown(keyEvent);
        };
        this.clickListener = (clickEvent) => {
            if(!this.element.contains(clickEvent.target)) {
                this.closeDropdown();
            }
        };
        document.addEventListener("keydown", this.keyListener);
        document.addEventListener("click", this.clickListener);
    }

    private onKeyDown(keyEvent) {
        if(this.opened) {
            if(keyEvent.keyCode == keycode("down")) {
                this.highlight(this.highlightedIndex+1);
                setTimeout(() => this.scrollHighlightedToView(), 0);
            }else if(keyEvent.keyCode == keycode("up")) {
                this.highlight(this.highlightedIndex-1);
                setTimeout(() => this.scrollHighlightedToView(), 0);
            }else if(keyEvent.keyCode == keycode("enter")) {
                this.select(this.highlightedIndex);
                this.closeDropdown();
            }else if(keyEvent.keyCode == keycode("escape") || 
                    keyEvent.keyCode == keycode('tab')) {
                this.closeDropdown();
            }
        }
    }

    private scrollHighlightedToView() {
        if(this.highlightedIndex || this.highlightedIndex === 0) {
            this.scrollItemToView(this.highlightedIndex);
        }
    }

    private scrollItemToView(index) {
        let elementScrollTop = 0;
        if(this.noResults) {
            elementScrollTop = this.noResultsElement.scrollHeight;
        }
        for(var i = 0; i < index; i++) {
            elementScrollTop += this.items[i]._element.scrollHeight;
        }
        var element = this.items[index]._element;
        let viewPaneHeight = element.parentNode.parentNode.scrollHeight;
        let elementScrollBottom = elementScrollTop + element.scrollHeight;

        if(element.parentNode.scrollTop < elementScrollBottom - viewPaneHeight) {
            element.parentNode.scrollTop = elementScrollBottom - viewPaneHeight;
        }else if(element.parentNode.scrollTop > elementScrollTop) {
            element.parentNode.scrollTop = elementScrollTop;
        }
    }

    public detached() {
        document.removeEventListener("keydown", this.keyListener);
        document.removeEventListener("click", this.clickListener);
    }

    public onClick(clickEvent) {
        if(clickEvent.target.classList.contains("select2-selection__clear")) {
            this.clearSelection();
            this.closeDropdown();
        }else{
            this.toggleDropdown();
        }
    }

    onClickItem(index, clickEvent) {
        this.select(index);
        if(index < this.items.length && index >= 0) {
            this.scrollItemToView(index);
        }
        this.closeDropdown();
    }

    toggleDropdown() {
        if(this.opened) {
            this.closeDropdown();
        }else{
            this.openDropdown();
        }

    }

    openDropdown() {
        this.opened = true;
        setTimeout(() => {
            this.searchTextElement['focus']();
        }, 1);
        this.setDropdownPosition();
        this.highlight(this.selectedIndex || 0);
    }

    private setDropdownPosition() {
        this.dropdownElement['style']['left'] = this.displayElement['offsetLeft'] + "px";
        this.dropdownElement['style']['top'] = (this.displayElement['offsetTop'] + this.displayElement['offsetHeight']) + "px";

        let width = this.width || "";
        if(width.indexOf("%") != -1) {
            width = this.displayElement['offsetWidth'] + "px";
        }
        console.info("width: ", width);
        this.dropdownElement['style']['width'] = width;
    }

    closeDropdown() {
        this.opened = false;
        this.searching = false;
    }

    select(index) {
        if(index < 0) index = 0;
        if(index >= this.items.length) index = this.items.length-1;
        this.selected = this.items[index];
        this.selectedIndex = index;
    }

    clearSelection() {
        this.selectedIndex = null;
        this.selected = null;
    }

    highlight(index) {
        if(index < 0) index = 0;
        if(index >= this.items.length) index = this.items.length-1;
        this.highlighted = this.items[index];
        this.highlightedIndex = index;
    }

    onSearchKeydown(keyEvent) {
        if(keyEvent.keyCode == keycode("down")) {
            return;
        }else if(keyEvent.keyCode == keycode("up")) {
            return;
        }else if(keyEvent.keyCode == keycode("enter")) {
            return;
        }else if(keyEvent.keyCode == keycode("escape") || 
                keyEvent.keyCode == keycode('tab')) {
            return;
        }else{
            this.search();
        }
    }

    private search() {
        this.searching = true;
        let anyFound = false;
        for(var item of this.items) {
            item.isMatch = this.matches(item);
            anyFound = anyFound || item.isMatch;
        }
        this.noResults = !anyFound;
    }

    private matches(item) {
        for(var key of Object.keys(item)) {
            if(typeof item[key] == "string") {
                if(item[key].toLowerCase().indexOf(this.searchText) != -1) {
                    return true;
                }
            }
        }
        return false;
    }
}
