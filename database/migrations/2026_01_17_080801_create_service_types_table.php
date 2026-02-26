<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   // database/migrations/xxxx_create_service_types_table.php
    public function up()
    {
        Schema::create('service_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Oil Change, Brake Pads, etc
            $table->text('description')->nullable();
            $table->integer('recommended_interval_km')->nullable(); // كل كام كيلو
            $table->integer('recommended_interval_days')->nullable(); // كل كام يوم
            $table->string('category')->nullable(); // Engine, Brakes, Tires, etc
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_types');
    }
};
