"""
Bulk Operations Service for CSV import/export and mass updates.
Enables vendors to manage inventory at scale.
"""
import csv
import io
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime


@dataclass
class ImportResult:
    """Result of a bulk import operation."""
    success_count: int
    error_count: int
    errors: List[Dict]
    created_ids: List[str]


@dataclass 
class ExportResult:
    """Result of a bulk export operation."""
    csv_content: str
    row_count: int
    exported_at: datetime


class BulkOperationsService:
    """Handle bulk import/export and mass updates for inventory."""
    
    # Expected CSV columns for product import
    PRODUCT_COLUMNS = [
        "name", "price_ngn", "stock_level", "category", 
        "description", "voice_tags", "image_url"
    ]
    
    def __init__(self):
        self._supabase = None
        self._init_supabase()
    
    def _init_supabase(self):
        """Initialize Supabase client if available."""
        try:
            import os
            from supabase import create_client
            
            url = os.getenv("SUPABASE_URL", "")
            key = os.getenv("SUPABASE_KEY", "")
            
            if url and key:
                self._supabase = create_client(url, key)
        except Exception as e:
            print(f"⚠️ Supabase not available for bulk ops: {e}")
    
    def parse_csv(self, csv_content: str) -> Tuple[List[Dict], List[Dict]]:
        """
        Parse CSV content into list of product dictionaries.
        
        Returns:
            Tuple of (valid_products, errors)
        """
        valid_products = []
        errors = []
        
        try:
            reader = csv.DictReader(io.StringIO(csv_content))
            
            for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
                try:
                    product = self._validate_product_row(row, row_num)
                    if product:
                        valid_products.append(product)
                except ValueError as e:
                    errors.append({
                        "row": row_num,
                        "error": str(e),
                        "data": row
                    })
                    
        except Exception as e:
            errors.append({"row": 0, "error": f"CSV parse error: {e}"})
        
        return valid_products, errors
    
    def _validate_product_row(self, row: Dict, row_num: int) -> Optional[Dict]:
        """Validate and normalize a product row from CSV."""
        # Required fields
        name = row.get("name", "").strip()
        if not name:
            raise ValueError("Product name is required")
        
        # Price (required)
        try:
            price_str = row.get("price_ngn", "0").replace(",", "").replace("₦", "")
            price_ngn = float(price_str)
            if price_ngn < 0:
                raise ValueError("Price cannot be negative")
        except ValueError:
            raise ValueError(f"Invalid price: {row.get('price_ngn')}")
        
        # Stock (optional, default 0)
        try:
            stock_level = int(row.get("stock_level", "0"))
            if stock_level < 0:
                stock_level = 0
        except ValueError:
            stock_level = 0
        
        # Voice tags (comma-separated)
        voice_tags_str = row.get("voice_tags", "")
        voice_tags = [t.strip() for t in voice_tags_str.split(",") if t.strip()]
        
        return {
            "name": name,
            "price_ngn": price_ngn,
            "stock_level": stock_level,
            "category": row.get("category", "").strip() or None,
            "description": row.get("description", "").strip() or None,
            "voice_tags": voice_tags,
            "image_url": row.get("image_url", "").strip() or None
        }
    
    async def import_products(
        self, 
        vendor_id: str, 
        csv_content: str,
        update_existing: bool = False
    ) -> ImportResult:
        """
        Import products from CSV.
        
        Args:
            vendor_id: Vendor to import for
            csv_content: Raw CSV string
            update_existing: If True, update products with same name
            
        Returns:
            ImportResult with counts and any errors
        """
        valid_products, parse_errors = self.parse_csv(csv_content)
        
        if not valid_products and parse_errors:
            return ImportResult(
                success_count=0,
                error_count=len(parse_errors),
                errors=parse_errors,
                created_ids=[]
            )
        
        created_ids = []
        import_errors = parse_errors.copy()
        
        for product in valid_products:
            try:
                product["vendor_id"] = vendor_id
                
                if self._supabase:
                    # Check if product exists (by name)
                    existing = self._supabase.table("products").select("id").eq(
                        "vendor_id", vendor_id
                    ).eq("name", product["name"]).execute()
                    
                    if existing.data and update_existing:
                        # Update existing
                        self._supabase.table("products").update(product).eq(
                            "id", existing.data[0]["id"]
                        ).execute()
                        created_ids.append(existing.data[0]["id"])
                    elif not existing.data:
                        # Create new
                        result = self._supabase.table("products").insert(product).execute()
                        if result.data:
                            created_ids.append(result.data[0]["id"])
                else:
                    # Mock mode - just count as success
                    created_ids.append(f"mock-{len(created_ids)}")
                    
            except Exception as e:
                import_errors.append({
                    "product": product["name"],
                    "error": str(e)
                })
        
        return ImportResult(
            success_count=len(created_ids),
            error_count=len(import_errors),
            errors=import_errors,
            created_ids=created_ids
        )
    
    async def export_products(self, vendor_id: str) -> ExportResult:
        """
        Export all vendor products to CSV.
        
        Args:
            vendor_id: Vendor to export for
            
        Returns:
            ExportResult with CSV content
        """
        products = []
        
        if self._supabase:
            result = self._supabase.table("products").select("*").eq(
                "vendor_id", vendor_id
            ).execute()
            products = result.data or []
        
        # Build CSV
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=self.PRODUCT_COLUMNS)
        writer.writeheader()
        
        for product in products:
            writer.writerow({
                "name": product.get("name", ""),
                "price_ngn": product.get("price_ngn", 0),
                "stock_level": product.get("stock_level", 0),
                "category": product.get("category", ""),
                "description": product.get("description", ""),
                "voice_tags": ",".join(product.get("voice_tags", [])),
                "image_url": product.get("image_url", "")
            })
        
        return ExportResult(
            csv_content=output.getvalue(),
            row_count=len(products),
            exported_at=datetime.now()
        )
    
    async def bulk_update_prices(
        self, 
        vendor_id: str, 
        percent_change: float,
        category: Optional[str] = None
    ) -> Dict:
        """
        Update prices by percentage.
        
        Args:
            vendor_id: Target vendor
            percent_change: e.g., 10 for +10%, -5 for -5%
            category: Optional category filter
            
        Returns:
            Summary of updates
        """
        if not self._supabase:
            return {"success": False, "error": "Database not available"}
        
        try:
            # Get products to update
            query = self._supabase.table("products").select("id, name, price_ngn").eq(
                "vendor_id", vendor_id
            )
            
            if category:
                query = query.eq("category", category)
            
            result = query.execute()
            products = result.data or []
            
            if not products:
                return {"success": True, "updated_count": 0, "message": "No products found"}
            
            # Calculate and update new prices
            multiplier = 1 + (percent_change / 100)
            updated_count = 0
            
            for product in products:
                new_price = round(product["price_ngn"] * multiplier, 2)
                
                self._supabase.table("products").update({
                    "price_ngn": new_price
                }).eq("id", product["id"]).execute()
                
                updated_count += 1
            
            return {
                "success": True,
                "updated_count": updated_count,
                "percent_change": percent_change,
                "category": category or "all"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def bulk_restock(
        self, 
        vendor_id: str, 
        restock_data: List[Dict]
    ) -> Dict:
        """
        Bulk restock multiple products.
        
        Args:
            vendor_id: Target vendor
            restock_data: List of {"product_id": str, "quantity": int}
            
        Returns:
            Summary of updates
        """
        if not self._supabase:
            return {"success": False, "error": "Database not available"}
        
        updated = 0
        errors = []
        
        for item in restock_data:
            try:
                product_id = item.get("product_id")
                quantity = item.get("quantity", 0)
                
                # Get current stock
                result = self._supabase.table("products").select("stock_level").eq(
                    "id", product_id
                ).eq("vendor_id", vendor_id).execute()
                
                if result.data:
                    current_stock = result.data[0]["stock_level"]
                    new_stock = current_stock + quantity
                    
                    self._supabase.table("products").update({
                        "stock_level": new_stock
                    }).eq("id", product_id).execute()
                    
                    updated += 1
                else:
                    errors.append({"product_id": product_id, "error": "Product not found"})
                    
            except Exception as e:
                errors.append({"product_id": item.get("product_id"), "error": str(e)})
        
        return {
            "success": True,
            "updated_count": updated,
            "error_count": len(errors),
            "errors": errors
        }
    
    def generate_template_csv(self) -> str:
        """Generate a blank CSV template for product import."""
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=self.PRODUCT_COLUMNS)
        writer.writeheader()
        
        # Add example row
        writer.writerow({
            "name": "Example Product",
            "price_ngn": "5000",
            "stock_level": "10",
            "category": "Electronics",
            "description": "Product description here",
            "voice_tags": "tag1,tag2,tag3",
            "image_url": ""
        })
        
        return output.getvalue()


# Singleton instance
bulk_service = BulkOperationsService()
