// helper for simple non-batched upsert destinations

export const Destination = (objects) => {
    return {
        test_connection: () => {
            return { success: true };
        },
        list_objects: () => {
            Object.keys(objects).map(name => ({ object_api_name: name, label: objects[name].label }))
        },
        supported_operations: ({ object }) => {
            return ["upsert"];
        },
        list_fields: ({ object }) => {
            return { fields: objects[object.object_api_name].fields };
        },
        get_sync_speed: () => {
            return {
                maximum_batch_size: 100,
                maximum_records_per_second: 10,
                maximum_parallel_batches: 4,
            };
        },
        sync_batch: async ({ sync_plan, records }) => {
            const key_column = Object.values(sync_plan.schema).find(v => v.active_identifier).field.field_api_name;
            const record_results = await Promise.all(records.map(async record => {
                try {
                    const res = await objects[sync_plan.object.object_api_name].upsertHandler(record);
                    return {
                        identifier: record[key_column],
                        success: true,
                    };
                } catch (error) {
                    return {
                        identifier: record[key_column],
                        success: false,
                        error_message: error.code,
                    };
                }
            }));
            return { record_results };
        }
    }
}