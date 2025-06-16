import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  constructor(private _http: SingletonService) { }
  //-----> Products API
  // Get Products 
  getProducts(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}product${params}` );
  }
  addProduct(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/`,addForm);
  }
  getProductById(id:number | string){
    return this._http.getRequest(`${environment.api_url}product/${id}`);
  }
  updateProduct(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}product/${id}/` , editForm);
  }
  deleteProduct(id:number ){
    return this._http.deleteRequest(`${environment.api_url}product/${id}`);
  }
   getProductsCustomFields(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}product/custom-field-label/` );
  }

  getUnits(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}product/unit${params}` );
  }
  addUnit(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/unit/`,addForm);
  }
  getUnitById(id:number | string){
    return this._http.getRequest(`${environment.api_url}product/unit/${id}`);
  }
  updateUnit(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}product/unit/${id}/` , editForm);
  }
  deleteUnit(id:number ){
    return this._http.deleteRequest(`${environment.api_url}product/unit/${id}`);
  }
  
  getPurity(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}product/purity${params}` );
  }
  addPurity(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/purity/`,addForm);
  }
  getPurityById(id:number | string){
    return this._http.getRequest(`${environment.api_url}product/purity/${id}`);
  }
  updatePurity(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}product/purity/${id}/` , editForm);
  }
  deletePurity(id:number ){
    return this._http.deleteRequest(`${environment.api_url}product/purity/${id}`);
  }

  getSizes(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}product/size${params}` );
  }
  addSize(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/size/`,addForm);
  }
  getSizeById(id:number | string){
    return this._http.getRequest(`${environment.api_url}product/size/${id}`);
  }
  updateSize(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}product/size/${id}/` , editForm);
  }
  deleteSize(id:number ){
    return this._http.deleteRequest(`${environment.api_url}product/size/${id}`);
  }

  getCategories(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}product/category${params}` );
  }
  addCategory(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/category/`,addForm);
  }
  getCategoryById(id:number | string){
    return this._http.getRequest(`${environment.api_url}product/category/${id}`);
  }
  updateCategory(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}product/category/${id}/` , editForm);
  }
  deleteCategory(id:number ){
    return this._http.deleteRequest(`${environment.api_url}product/category/${id}`);
  }

  getStockPoints(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}product/stock-point${params}` );
  }
  addStockPoint(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/stock-point/`,addForm);
  }
  getStockPointById(id:number | string){
    return this._http.getRequest(`${environment.api_url}product/stock-point/${id}`);
  }
  updateStockPoint(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}product/stock-point/${id}/` , editForm);
  }
  deleteStockPoint(id:number ){
    return this._http.deleteRequest(`${environment.api_url}product/stock-point/${id}`);
  }

  getBrands(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}product/brand${params}` );
  }
  addBrand(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/brand/`,addForm);
  }
  getBrandById(id:number | string){
    return this._http.getRequest(`${environment.api_url}product/brand/${id}`);
  }
  updateBrand(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}product/brand/${id}/` , editForm);
  }
  deleteBrand(id:number ){
    return this._http.deleteRequest(`${environment.api_url}product/brand/${id}`);
  }

  getDesigners(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}product/designer${params}` );
  }
  addDesigner(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/designer/`,addForm);
  }
  getDesignerById(id:number | string){
    return this._http.getRequest(`${environment.api_url}product/designer/${id}`);
  }
  updateDesigner(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}product/designer/${id}/` , editForm);
  }
  deleteDesigner(id:number ){
    return this._http.deleteRequest(`${environment.api_url}product/designer/${id}`);
  }

  getStones(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}product/stone${params}` );
  }
  addStone(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/stone/`,addForm);
  }
  getStoneById(id:number | string){
    return this._http.getRequest(`${environment.api_url}product/stone/${id}`);
  }
  updateStone(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}product/stone/${id}/` , editForm);
  }
  deleteStone(id:number ){
    return this._http.deleteRequest(`${environment.api_url}product/stone/${id}`);
  }

  getColors(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}product/color${params}` );
  }
  addColor(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/color/`,addForm);
  }
  getColorById(id:number | string){
    return this._http.getRequest(`${environment.api_url}product/color/${id}`);
  }
  updateColor(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}product/color/${id}/` , editForm);
  }
  deleteColor(id:number ){
    return this._http.deleteRequest(`${environment.api_url}product/color/${id}`);
  }

  getTransferBranch(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}inventory/stock-transfer/${params}` );
  }
  addTransferBranch(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/stock/bulk-transfer/`,addForm);
  }
  getTransferBranchById(id:number | string){
    return this._http.getRequest(`${environment.api_url}product/stock/bulk-transfer/${id}`);
  }
  updateTransferBranch(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}product/stock/bulk-transfer/${id}/` , editForm);
  }
  deleteTransferBranch(id:number ){
    return this._http.deleteRequest(`${environment.api_url}product/stock/bulk-transfer/${id}`);
  }

  /// Labels API
  addOnlyOneProductLabel(id:any, addForm:any): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/label/${id}/`,addForm);
  }
  addBulkOfProductLabel( addForm:any): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/label/bulk/`,addForm);
  }
  getBulkOfProductLabel( addForm:any): Observable<any>{
    return this._http.postRequest(`${environment.api_url}product/label/bulk/`,addForm);
  }


  /// Imports
  importProducts(file:any){
    return this._http.postRequest(`${environment.api_url}product/import/`, file);
  }
}
